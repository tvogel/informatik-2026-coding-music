// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import simplestackQuery from '@simplestack/query';
import pwa from './src/integrations/pwa';

// https://astro.build/config
export default defineConfig({
  site: 'https://tvogel.github.io',
  base: '/informatik-2026-coding-music',
  integrations: [starlight({
    title: 'Informatik 10-12/2026: Music Live Coding',
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
    sidebar: [
      {
        label: 'Guides',
        items: [
          // Each item here is one entry in the navigation menu.
          { label: 'Example Guide', slug: 'guides/example' },
        ],
      },
      {
        label: 'Reference',
        items: [{ autogenerate: { directory: 'reference' } }],
      },
    ],
    components: {
      Head: './src/components/KursHead.astro',
    },
    customCss: [
      './src/styles/custom.css',
    ],
  }),
  simplestackQuery(),
  pwa({
    experimental: { directoryAndTrailingSlashHandler: true },
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
      name: 'Informatik 10-12/2026: Music Live Coding',
      short_name: 'Informatik 10-12/2026',
      description:
        'Kursmaterial für "Informatik 10-12/2026: Music Live Coding" an der Freien Waldorfschule Werder',
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
  }),
  ],
});