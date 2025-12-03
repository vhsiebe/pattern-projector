import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-08-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/tailwindcss', 'nuxt-auth-utils'],
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
    authSecret: process.env.AUTH_SESSION_PASSWORD,
    projectorKey: process.env.PROJECTOR_KEY,
    public: {
      appName: 'Pattern Projector',
      appDescription:
        'Pattern Projector is a browser-based companion for sewing and projecting patterns with calibration, measurement, and collaboration utilities.',
      projectorPollInterval: Number(process.env.PROJECTOR_POLL_MS ?? 1500),
    },
  },
  tailwindcss: {
    cssPath: ['~/assets/css/tailwind.css'],
    configPath: 'tailwind.config.ts',
  },
  ui: {
    primary: 'violet',
    icons: ['heroicons', 'ph'],
  },
  nitro: {
    plugins: ['~/server/plugins/mongodb'],
  },
  future: {
    compatibilityVersion: 4,
  },
})
