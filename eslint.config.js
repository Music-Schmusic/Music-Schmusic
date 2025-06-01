import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import node from 'eslint-plugin-node';
import jest from 'eslint-plugin-jest';
import cypressPlugin from 'eslint-plugin-cypress';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      prettier: prettierPlugin,
      node,
      jest,
    },
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        jest: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        TextEncoder: 'readonly',
        crypto: 'readonly',
        btoa: 'readonly',
        fetch: 'writable',
        global: 'writable',
        URLSearchParams: 'readonly',
        clearTimeout: 'readonly',
        Buffer: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...prettierConfig.rules,
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^(React|setIsLoggedIn||currentScene|_)',
          varsIgnorePattern:
            '^(React|Router|Route|Routes|Link|Navbar|Footer|Home|Dashboard|Login|SignUp|MyApp|BarChart|Bar|XAxis|YAxis|Tooltip|Legend|ResponsiveContainer|Pie|PieChart|Cell|CustomTooltip|authUrl|setAuthUrl|navigate|Navigate|Outlet|Spline|useState|AppContent|AppRoutes|useEffect|isLoggedIn|AccountRecovery|StatsIcon|Signup|OAuthSuccess|PublicRoute|ProtectedRoute|Form|Recommended|Settings|Friends|SplineBackground|username|password|mockGenres|dotenv|endpointId|location|projectId|predictionClient|playlistModel|listeningDataModel|_account|ResetValidation|ResetPassword)$',
        },
      ],
      'node/no-unsupported-features/es-syntax': 'off',
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    plugins: { jest },
    languageOptions: {
      globals: {
        test: 'readonly',
        expect: 'readonly',
      },
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
    },
  },
  {
    files: ['cypress/e2e/**/*.js'],
    plugins: {
      cypress: cypressPlugin,
    },
    languageOptions: {
      globals: {
        cy: 'readonly',
        describe: 'readonly',
        context: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        assert: 'readonly',
        Cypress: 'readonly',
      },
    },
    rules: {
      'jest/no-identical-title': 'off',
    },
  },
];
