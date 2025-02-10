import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import node from 'eslint-plugin-node';
import jest from 'eslint-plugin-jest';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      prettier: prettierPlugin,
      node,
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
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern:
            '^(React|Router|Route|Routes|Link|Navbar|Footer|Home|Dashboard|Login|SignUp|MyApp)$',
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
];
