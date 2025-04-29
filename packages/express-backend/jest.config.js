export default {
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  testEnvironment: 'node',
  rootDir: 'packages/express-backend',
  moduleDirectories: ['node_modules', '<rootDir>'],
  setupFilesAfterEnv: ['./jest.setup.js'], // Load Jest setup before tests
};
