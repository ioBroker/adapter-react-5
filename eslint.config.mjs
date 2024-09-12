import config from '@iobroker/eslint-config';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

// disable temporary the rule 'jsdoc/require-param' and enable 'jsdoc/require-jsdoc'
config.forEach(rule => {
    if (rule?.plugins?.jsdoc) {
        rule.rules['jsdoc/require-jsdoc'] = 'off';
        rule.rules['jsdoc/require-param'] = 'off';
    }
});
config.push({
    rules: {
        'class-methods-use-this': 'warn',
    }
})
config.push({
    plugins: {
        react: reactPlugin,
        'react-hooks': reactHooksPlugin,
    },
    rules: {
        ...reactPlugin.configs.recommended.rules,
        ...reactHooksPlugin.configs.recommended.rules,
        'react/no-unused-class-component-methods': 'warn',
        'react/prop-types': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        'react/no-is-mounted': 'off',
    },
    languageOptions: {
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
            ecmaVersion: 12,
            jsxPragma: 'React', // for @typescript/eslint-parser
        }
    },
    settings: {
        react: {
            version: 'detect', // Automatically detect the React version
        },
    },
});

export default [...config];
