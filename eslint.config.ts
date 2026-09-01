import js from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import type { Linter } from "eslint";
// eslint-plugin-jsx-a11y ships no type declarations (see types/eslint-plugin-jsx-a11y.d.ts),
// so the flat config shape is asserted below.
import jsxA11yUntyped from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

const jsxA11y = jsxA11yUntyped as { flatConfigs: { recommended: Linter.Config } };

const featureInternals = {
  group: ["~/features/*/**"],
  message:
    "Import a feature through its public surface (~/features/<name>). Deep imports into another feature's internals are not allowed.",
};

const featuresFromShared = {
  group: ["~/features/**"],
  message:
    "Shared code must not depend on a business domain. Invert the dependency: let the feature import from here.",
};

const deepRelative = {
  group: ["../../*", "../../**"],
  message:
    "Reach outside the current folder with the ~/ alias, not by walking up the tree. A single ../ to a sibling inside the same feature is fine.",
};

export default defineConfig(
  globalIgnores([
    "node_modules/",
    "build/",
    ".react-router/",
    "coverage/",
    "playwright-report/",
    "test-results/",
    "blob-report/",
    "public/mockServiceWorker.js",
  ]),

  {
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
      pluginQuery.configs["flat/recommended"],
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: globals.browser,
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": ["error", { destructuring: "all" }],
      "object-shorthand": ["error", "always"],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-else-return": ["error", { allowElseIf: false }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-restricted-imports": ["error", { patterns: [featureInternals, deepRelative] }],
      // This codebase uses `type` for object shapes throughout, including component
      // props. The rule is enabled in the opposite direction rather than switched off.
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      // React Router signals redirects and 404s by throwing a Response. That is the
      // framework's control flow, not an error being thrown in the wrong shape.
      "@typescript-eslint/only-throw-error": [
        "error",
        { allow: [{ from: "lib", name: "Response" }] },
      ],
    },
  },

  {
    files: ["src/components/ui/**"],
    rules: {
      // These files are generated from shadcn/ui and are kept diffable against
      // upstream. Rewriting them to satisfy stylistic nitpicks makes future upstream
      // comparisons harder for no behavioural gain.
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-template-expression": "off",
      "@typescript-eslint/no-unnecessary-type-conversion": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      // SidebarMenuSkeleton randomises its placeholder width once per mount, which
      // is the point of a skeleton — an unstable value here is cosmetic, not a
      // correctness bug. Scoped to these generated files, not to app code.
      "react-hooks/purity": "off",
      // InputGroupAddon focuses the input when its padding is clicked, and bails
      // when the click lands on a button. It is a redundant mouse affordance:
      // the input and any button are already in the tab order. Satisfying these
      // rules would mean making a role="group" div focusable to duplicate Tab.
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
    },
  },

  {
    files: ["src/components/**", "src/lib/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [featureInternals, featuresFromShared, deepRelative] },
      ],
    },
  },

  {
    files: ["src/services/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            featureInternals,
            featuresFromShared,
            deepRelative,
            {
              group: ["~/components/**"],
              message:
                "The service layer must stay UI-agnostic. Move anything that needs a component into a feature.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["**/*.{js,cjs,mjs}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },

  {
    files: ["*.{ts,mts,cts}", "src/mocks/**", "vitest.setup.ts", "e2e/**"],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ["**/*.{test,spec}.{ts,tsx}", "src/test/**", "vitest.setup.ts"],
    languageOptions: {
      globals: globals.vitest,
    },
    rules: {
      // Fixtures and assertions legitimately reach past the checks that protect production code.
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/unbound-method": "off",
      // The ResizeObserver stub in vitest.setup.ts implements an interface whose
      // methods jsdom never calls.
      "@typescript-eslint/no-empty-function": "off",
    },
  },
);
