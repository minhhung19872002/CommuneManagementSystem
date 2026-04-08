import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    defaultCommandTimeout: 10_000,
    viewportWidth: 1440,
    viewportHeight: 900,
  },
  downloadsFolder: 'cypress/downloads',
  screenshotsFolder: 'cypress/screenshots',
  video: false,
});
