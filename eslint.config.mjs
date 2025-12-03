import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt(
  {},
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      '.yarn/**',
      'legacy-react-app/**',
      'node_modules/**',
      'cypress/**',
    ],
  },
)
