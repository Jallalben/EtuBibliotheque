import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // L'application Angular doit tourner sur ce port pendant les tests E2E
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
  }
});
