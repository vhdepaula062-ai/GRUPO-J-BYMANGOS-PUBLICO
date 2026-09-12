module.exports = {
  extends: ["eslint:recommended"],
  env: {
    node: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error", "info"] }]
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    ".next/",
    ".turbo/",
    ".expo/",
    "coverage/"
  ]
};
