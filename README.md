# Informatik 10-12/2026: Coding Music

Kursmaterial für das Wahlfach Informatik an der Freien Waldorfschule Werder.
Die Schülerinnen und Schüler lernen zwischen Musik, Kreativität und einer
abstrakten Sprache zu übersetzen, indem sie mit [Strudel](https://strudel.cc/)
Musik machen. Die Beispiele laufen direkt auf der Seite.

Veröffentlicht unter
<https://tvogel.github.io/informatik-2026-coding-music/>. Die Seite ist als
App (PWA) installierbar und funktioniert dann auch offline.

## Entwickeln

Gebaut ist die Seite mit [Astro](https://docs.astro.build) und
[Starlight](https://starlight.astro.build/), Paketmanager ist pnpm.

| Befehl         | Wirkung                                                |
| :------------- | :----------------------------------------------------- |
| `pnpm install` | Abhängigkeiten installieren                            |
| `pnpm dev`     | Entwicklungsserver auf `localhost:4321` starten        |
| `pnpm build`   | Seite nach `dist/` bauen                               |
| `pnpm preview` | Gebaute Seite lokal ansehen                            |
| `pnpm test`    | Seite bauen und die PWA in Chrome prüfen (siehe unten) |

## Aufbau

```
src/content/docs/
├── index.mdx      Startseite
├── guides/        Kapitel des Kurses (Reihenfolge: Sidebar in astro.config.mjs)
└── exercises/     Übungen (Sidebar automatisch nach Dateinamen)
src/components/
├── MiniRepl.astro   Strudel-Editor mit Play-Button: <MiniRepl name="…" tune={`s("bd sd")`} />
├── VexFlow.astro    Notensatz mit VexFlow
├── Answer.astro     Antwortfeld für Übungen
├── KursHead.astro   <head>: Strudel laden, Icons, PWA-Registrierung
└── SiteTitle.astro  Kopfzeile mit eingebettetem Logo
src/integrations/pwa.ts   Astro-Integration um vite-plugin-pwa
patches/                  pnpm-Patches für Abhängigkeiten
scripts/                  Logo und Icons erzeugen
```

Neue Seiten sind `.md`- oder `.mdx`-Dateien unter `src/content/docs/`; der
Dateipfad ergibt die URL. Kapitel unter `guides/` müssen zusätzlich in die
Sidebar in `astro.config.mjs` eingetragen werden.

### Logo und Icons

Das Logo (Noten mit Seerosenblatt-Köpfen und den Bits „1 0 1“, in den Farben
der Schule) wird von `scripts/gen_logo.py` erzeugt; die Aufrufe stehen im
Kopf des Skripts. Die PNG-Icons für Manifest und Apple-Geräte rendert
`scripts/render_icons.sh` daraus (braucht Inkscape und ImageMagick).

### Patch für @strudel/repl

`patches/@strudel__repl.patch` gibt jedem `<strudel-editor>` eine eigene ID.
Ohne ihn friert der Browser ein, sobald zwei Editoren auf einer Seite
`._pianoroll()` o. Ä. verwenden. pnpm wendet ihn bei `pnpm install`
automatisch an.

## Test

`pnpm test` baut die Seite mit dem Base-Pfad von GitHub Pages und prüft:

- **Build:** Manifest und Icons, `theme-color` und Sprache passend zum
  Manifest, Manifest-Link auf jeder Seite, alle vom Service Worker
  vorgeladenen URLs existieren.
- **In Chrome:** Der Service Worker übernimmt, Chrome hält die Seite für
  installierbar, Seiten laden offline, und eine neue Version erscheint ohne
  Shift-Reload.

Der Test steuert das installierte Google Chrome über `playwright-core`; ein
anderes Chrome lässt sich mit `CHROME_PATH` angeben. Mit
`PWA_TEST_DIST=<Ordner>` prüft er einen vorhandenen Build, statt selbst zu
bauen.

## Veröffentlichen

Jeder Push auf `main` startet `.github/workflows/deploy.yml`: Die Seite wird
gebaut, mit `pnpm test` geprüft und nur bei Erfolg auf GitHub Pages
veröffentlicht.

## Lizenz

[GNU AGPL v3](LICENSE)
