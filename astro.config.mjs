// @ts-check
import starlight from '@astrojs/starlight';
import starlightQuiz from 'starlight-quiz';
import simplestackQuery from '@simplestack/query';

import { defineConfig } from 'astro/config';
import pwa from './src/integrations/pwa';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  trailingSlash: 'always',
  integrations: [starlight({
    locales: {
      root: {
        label: 'Deutsch',
        lang: 'de',
      }
    },
    title: 'Informatik 10-12/2026: Coding Music',
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
    sidebar: [
      {
        label: 'Kurs',
        items: [
          // Each item here is one entry in the navigation menu.
          { label: 'Ankündigung', slug: 'guides/announcement' },
          { label: 'Willkommen', slug: 'guides/welcome' },
          { label: 'Erste Schritte', slug: 'guides/first_steps' },
          { label: 'Schlagzeug-Noten', slug: 'guides/drum_notation' },
          { label: 'Schallwellen', slug: 'guides/physical_sounds' },
          { label: 'Melodien', slug: 'guides/melodies' },
          { label: 'Tonleitern', slug: 'guides/scales' },
          { label: 'Zufälligkeiten', slug: 'guides/randomness' },
        ],
      },
      {
        label: 'Übungen',
        items: [{ autogenerate: { directory: 'exercises' } }],
      },
      {
        label: 'Strudel',
        items: [
          { label: 'Dokumentation', link: 'https://strudel.cc/learn' },
          { label: 'REPL', link: 'https://strudel.cc/' }
        ],
      },
    ],
    components: {
      Head: './src/components/KursHead.astro',
      SiteTitle: './src/components/SiteTitle.astro',
    },
    customCss: [
      './src/styles/custom.css',
    ],
    plugins: [starlightQuiz()],
  }), mdx(), simplestackQuery(), pwa({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    workbox: {
      maximumFileSizeToCacheInBytes: 4194304, // 4MB
      globPatterns: ['**/*.{js,css,html,ico,png,svg,json,wav,mp3,ogg,ttf,woff2,TTF,otf}'],
      runtimeCaching: [
        {
          urlPattern: ({ url }) =>
            [
              /^https:\/\/raw\.githubusercontent\.com\/.*/i,
              /^https:\/\/strudel\.b-cdn\.net\/.*/i,
              /^https:\/\/freesound\.org\/.*/i,
              /^https:\/\/cdn\.freesound\.org\/.*/i,
              /^https:\/\/shabda\.ndre\.gr\/.*/i,
            ].some((regex) => regex.test(url.toString())),
          handler: 'CacheFirst',
          options: {
            cacheName: 'external-samples',
            expiration: {
              maxEntries: 5000,
              maxAgeSeconds: 60 * 60 * 24 * 30, // <== 14 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
    },
    manifest: {
      name: 'Informatik 10-12/2026: Coding Music',
      short_name: 'Informatik 10-12/2026',
      description:
        'Kursmaterial für "Informatik 10-12/2026: Coding Music" an der Freien Waldorfschule Werder',
      lang: 'de',
      // keep in sync with <meta name="theme-color"> in KursHead.astro
      theme_color: '#00807e',
      // rendered from the logo by scripts/render_icons.sh
      icons: [
        {
          src: 'icons/manifest-icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'icons/manifest-icon-192.maskable.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'icons/manifest-icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: 'icons/manifest-icon-512.maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
  })],
});