const base = require('@newera365/config/eslint-preset');

module.exports = {
  ...base,
  // Archived one-off scripts (already run against prod) are reference-only:
  // excluded from tsconfig and lint alike. See src/scripts/archive/README.md.
  ignorePatterns: [...(base.ignorePatterns ?? []), 'src/scripts/archive/'],
  overrides: [
    ...(base.overrides ?? []),
    {
      // Plain Node.js scripts use CommonJS require() — suppress TS rule for .js files
      files: ['src/scripts/*.js'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
};
