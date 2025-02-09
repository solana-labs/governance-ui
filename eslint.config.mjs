import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
)), {
    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        "unused-imports": unusedImports,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.jest,
            ...globals.node,
        },

        parser: tsParser,
    },

    settings: {
        react: {
            version: "detect",
        },
    },

    files: ["**/*.ts","**/*.tsx", "**/*.js", "**/*.jsx"],

    ignores: ["**/node_modules/*", "**/out/*", "**/.next/*", "**/docs/build/*"],

    rules: {
        "react-hooks/exhaustive-deps": ["warn", {
            additionalHooks: "(useAsync|useAsyncCallback|useAsyncAbortable)",
        }],

        "react/react-in-jsx-scope": 0,
        "react/display-name": 0,
        "react/prop-types": 0,
        "unused-imports/no-unused-imports": "error",
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "@typescript-eslint/explicit-member-accessibility": 0,
        "@typescript-eslint/indent": 0,
        "@typescript-eslint/member-delimiter-style": 0,
        "@typescript-eslint/ban-ts-comment": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/no-use-before-define": 0,

        "@typescript-eslint/no-unused-vars": [2, {
            argsIgnorePattern: "^_",
        }],
    },
}];
