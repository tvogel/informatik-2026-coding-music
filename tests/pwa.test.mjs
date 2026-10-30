// Builds the site like the GitHub Pages workflow does and checks that the PWA
// is installable, works offline and picks up a new deployment by itself.
//
// Run with `pnpm test`. Needs Google Chrome (or set CHROME_PATH). To skip the
// build and test an existing one (as CI does with what it deploys), set
// PWA_TEST_DIST to its output directory.
import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright-core";

// base path of our own build, as on GitHub Pages; for PWA_TEST_DIST it is
// taken from the manifest
let BASE = "/informatik-2026-coding-music/";
// a page that is precached, but not the start page
const PAGE = "guides/welcome/";

let tmp;
let dist;

before(async () => {
  // not os.tmpdir(): Astro moves files into outDir by renaming, which fails
  // across file systems
  const cache = path.resolve("node_modules/.cache");
  await mkdir(cache, { recursive: true });
  tmp = await mkdtemp(path.join(cache, "pwa-test-"));
  dist = process.env.PWA_TEST_DIST ?? path.join(tmp, "dist");
  if (!process.env.PWA_TEST_DIST) {
    execFileSync("pnpm", ["astro", "build", "--base", BASE, "--outDir", dist], {
      stdio: ["ignore", "ignore", "inherit"],
    });
  } else {
    BASE = (await readJson(path.join(dist, "manifest.webmanifest"))).scope;
  }
});

after(async () => {
  await rm(tmp, { recursive: true, force: true });
});

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

/** All `{url, revision}` entries of the generated service worker. */
function precacheEntries(sw) {
  return [...sw.matchAll(/\{url:"([^"]*)",revision:(?:"([^"]*)"|null)\}/g)].map(
    ([, url, revision]) => ({ url, revision }),
  );
}

/** Width and height from a PNG's IHDR chunk. */
function pngSize(buf) {
  assert.equal(buf.toString("latin1", 1, 4), "PNG");
  return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
}

describe("build output", () => {
  test("manifest describes an installable app", async () => {
    const m = await readJson(path.join(dist, "manifest.webmanifest"));
    assert.ok(m.name && m.short_name);
    assert.match(m.scope, /^\/(.+\/)?$/);
    assert.ok(m.start_url.startsWith(BASE), `start_url ${m.start_url} outside scope`);
    assert.ok(["standalone", "fullscreen", "minimal-ui"].includes(m.display));

    for (const size of ["192x192", "512x512"]) {
      for (const purpose of ["any", "maskable"]) {
        const icon = m.icons.find((i) => i.sizes === size && i.purpose === purpose);
        assert.ok(icon, `no ${purpose} icon ${size}`);
        const png = await readFile(path.join(dist, icon.src));
        assert.equal(pngSize(png), size, icon.src);
      }
    }
  });

  test("theme-color matches the manifest", async () => {
    const m = await readJson(path.join(dist, "manifest.webmanifest"));
    const html = await readFile(path.join(dist, "index.html"), "utf8");
    const meta = html.match(/<meta name="theme-color" content="([^"]*)"/)?.[1];
    assert.equal(meta?.toLowerCase(), m.theme_color.toLowerCase());
  });

  test("manifest language matches the pages", async () => {
    const m = await readJson(path.join(dist, "manifest.webmanifest"));
    const html = await readFile(path.join(dist, "index.html"), "utf8");
    assert.equal(m.lang, html.match(/<html lang="([^"]*)"/)?.[1]);
  });

  test("every page links the manifest and the Apple touch icon", async () => {
    const pages = (await readdir(dist, { recursive: true })).filter(
      (f) => f === "index.html" || f.endsWith(`${path.sep}index.html`),
    );
    assert.ok(pages.length > 5, `only ${pages.length} pages found`);
    for (const page of pages) {
      const html = await readFile(path.join(dist, page), "utf8");
      assert.match(html, new RegExp(`<link rel="manifest" href="${BASE}manifest.webmanifest"`), page);
      const touchIcon = html.match(/<link rel="apple-touch-icon" href="([^"]*)"/)?.[1];
      assert.ok(touchIcon?.startsWith(BASE), `${page}: apple-touch-icon ${touchIcon}`);
      assert.ok(existsSync(path.join(dist, touchIcon.slice(BASE.length))), touchIcon);
    }
  });

  test("every precached URL exists", async () => {
    // A single 404 makes the service worker installation fail.
    const entries = precacheEntries(await readFile(path.join(dist, "sw.js"), "utf8"));
    assert.ok(entries.length > 10, `only ${entries.length} precache entries`);
    const urls = entries.map((e) => e.url);
    assert.ok(urls.includes(BASE), "start page not precached");
    assert.ok(urls.includes(PAGE), `${PAGE} not precached`);
    for (const url of urls) {
      const rel = url.startsWith(BASE) ? url.slice(BASE.length) : url;
      const file = rel === "" || rel.endsWith("/") ? `${rel}index.html` : rel;
      assert.ok(existsSync(path.join(dist, file)), `precached ${url} not in build`);
    }
  });
});

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".wasm": "application/wasm",
};

/** Static server like GitHub Pages: site under BASE, `dir/` serves `dir/index.html`. */
async function serve(root) {
  const state = { offline: false };
  const server = http.createServer(async (req, res) => {
    if (state.offline) return req.socket.destroy();
    const { pathname } = new URL(req.url, "http://localhost");
    let file = path.join(root, decodeURIComponent(pathname.slice(BASE.length)));
    if (pathname.endsWith("/")) file = path.join(file, "index.html");
    try {
      if (!pathname.startsWith(BASE) || !file.startsWith(root)) throw new Error();
      const body = await readFile(file);
      res.writeHead(200, {
        "content-type": TYPES[path.extname(file)] ?? "application/octet-stream",
        "cache-control": "no-cache",
      });
      res.end(body);
    } catch {
      res.writeHead(404, { "content-type": TYPES[".html"] });
      res.end("not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  state.url = `http://127.0.0.1:${server.address().port}${BASE}`;
  state.close = () => {
    server.closeAllConnections();
    return new Promise((resolve) => server.close(resolve));
  };
  return state;
}

describe("in Chrome", () => {
  let root;
  let server;
  let context;
  let page;

  before(async () => {
    // a copy, so the update test can "deploy" a change
    root = path.join(tmp, "www");
    await cp(dist, root, { recursive: true });
    server = await serve(root);
    // persistent context: Chrome never offers to install from incognito
    context = await chromium.launchPersistentContext(path.join(tmp, "profile"), {
      channel: process.env.CHROME_PATH ? undefined : "chrome",
      executablePath: process.env.CHROME_PATH,
      headless: true,
      args: [
        "--mute-audio",
        // keep the test offline apart from our server (Strudel loads samples)
        "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1",
      ],
    });
    page = context.pages()[0] ?? (await context.newPage());
  });

  after(async () => {
    await context?.close();
    await server?.close();
  });

  test("service worker takes control", async () => {
    await page.goto(server.url);
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, {
      timeout: 30_000,
    });
  });

  test("Chrome considers the app installable", async () => {
    const cdp = await context.newCDPSession(page);
    const { errors: manifestErrors } = await cdp.send("Page.getAppManifest");
    assert.deepEqual(manifestErrors, []);
    const { installabilityErrors } = await cdp.send("Page.getInstallabilityErrors");
    assert.deepEqual(installabilityErrors, []);
  });

  test("pages load offline", async () => {
    server.offline = true;
    try {
      await page.goto(server.url + PAGE);
      assert.match(await page.title(), /Willkommen/);
      // unknown URLs fall back to the start page instead of a browser error
      await page.goto(server.url + "not/precached/");
      assert.match(await page.locator("h1").first().innerText(), /Informatik/);
    } finally {
      server.offline = false;
    }
  });

  test("a new deployment replaces the cached pages", async () => {
    const marker = "pwa-test-new-version";
    const html = path.join(root, PAGE, "index.html");
    await writeFile(html, (await readFile(html, "utf8")).replace("</body>", `<p id="${marker}"></p></body>`));
    // what the next build would produce: a new revision for the changed page
    const swFile = path.join(root, "sw.js");
    const sw = await readFile(swFile, "utf8");
    const updated = sw.replace(
      new RegExp(`(\\{url:"${PAGE}(?:index\\.html)?",revision:")[^"]*`, "g"),
      "$1changed",
    );
    assert.notEqual(updated, sw);
    await writeFile(swFile, updated);

    // The navigation is answered from the cache, but makes Chrome check sw.js
    // a few seconds after the page has loaded (further navigations postpone it).
    const response = await page.goto(server.url + PAGE);
    assert.ok(!(await response.text()).includes(marker), "change served before any update");
    // With autoUpdate the new worker takes over and registerSW reloads the open
    // page, so the change shows up without any Shift-Reload.
    await page.waitForSelector(`#${marker}`, { state: "attached", timeout: 30_000 });
  });
});
