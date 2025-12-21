module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/integration/**/*.test.js"],
  verbose: true,
  maxWorkers: 1,
  rootDir: ".",
  moduleNameMapper: {
    "^config/(.*)$": "<rootDir>/config/$1",
  },
};
