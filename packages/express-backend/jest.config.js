export default {
  testEnvironment: 'node',
  transform: {}, // Disable Babel by default since we're running native ESM
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Needed for imports to resolve in ESM
  },
};
