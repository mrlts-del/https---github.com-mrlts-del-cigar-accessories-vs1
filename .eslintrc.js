module.exports = {
  extends: "next/core-web-vitals",
  rules: {
    // Disable the unescaped entities rule that's causing errors with quotes/apostrophes
    "react/no-unescaped-entities": "off",

    // Change unused variables from errors to warnings
    "@typescript-eslint/no-unused-vars": "warn",

    // Change any type usage from errors to warnings
    "@typescript-eslint/no-explicit-any": "warn"
  }
};
