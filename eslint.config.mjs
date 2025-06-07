import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Disable rules for Prisma generated files
    files: [
      "**/prisma/generated/**/*.ts",
      "**/prisma/generated/**/*.js",
      "**/node_modules/**/*.ts",
      "**/node_modules/**/*.js"
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-wrapper-object-types": "off"
    }
  },
  {
    // Disable rules for all JavaScript files (mostly generated files)
    files: ["**/*.js"],
    rules: {
      "@typescript-eslint/no-var-requires": "off"
    }
  },
  {
    // Enable TypeScript rules for TypeScript files
    files: ["**/*.ts", "**/*.tsx"],
    excludedFiles: [
      "**/prisma/generated/**/*.ts",
      "**/node_modules/**/*.ts"
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];

export default eslintConfig;
