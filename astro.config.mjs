// @ts-check
import starlight from '@astrojs/starlight';
import starlightQuiz from 'starlight-quiz';
import simplestackQuery from '@simplestack/query';

import { defineConfig } from 'astro/config'
  ;
import pwa from './src/integrations/pwa';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
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
          // { label: 'Pianoroll bug', slug: 'guides/bug' },
        ],
      },
      {
        label: 'Übungen',
        items: [{ autogenerate: { directory: 'exercises' } }],
      },
      {
        label: 'Dokumentation',
        items: [
          { label: 'Strudel', link: 'https://strudel.cc/learn' }
        ],
      },
    ],
    components: {
      Head: './src/components/KursHead.astro',
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
      // includeAssets: ['favicon.ico', 'icons/apple-icon-180.png'],
      name: 'Informatik 10-12/2026: Coding Music',
      short_name: 'Informatik 10-12/2026',
      description:
        'Kursmaterial für "Informatik 10-12/2026: Coding Music" an der Freien Waldorfschule Werder',
      theme_color: '#222222',
      // icons: [
      //   {
      //     src: 'icons/manifest-icon-192.maskable.png',
      //     sizes: '192x192',
      //     type: 'image/png',
      //     purpose: 'any',
      //   },
      //   {
      //     src: 'icons/manifest-icon-192.maskable.png',
      //     sizes: '192x192',
      //     type: 'image/png',
      //     purpose: 'maskable',
      //   },
      //   {
      //     src: 'icons/manifest-icon-512.maskable.png',
      //     sizes: '512x512',
      //     type: 'image/png',
      //     purpose: 'any',
      //   },
      //   {
      //     src: 'icons/manifest-icon-512.maskable.png',
      //     sizes: '512x512',
      //     type: 'image/png',
      //     purpose: 'maskable',
      //   },
      // ],
    },
  })],
});