// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.?(m)js"],
    transform: {},
    collectCoverage: true,
    coverageReporters: ["lcov", "text", "teamcity"],
    testResultsProcessor: "jest-teamcity-reporter",
};

module.exports = config;
