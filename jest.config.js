export default {
  testEnvironment: 'node',
  transform: {}, // Don't use Babel or TypeScript transforms
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // ESM-safe import mapping
  },
  roots: ['<rootDir>/packages/express-backend'], // Limit to your backend tests
};
