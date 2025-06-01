// cypress.config.js
import { defineConfig } from 'cypress';
import dbrequests from './packages/express-backend/dbrequests';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
  },
});
