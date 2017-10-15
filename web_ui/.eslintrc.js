module.exports = {
    extends: 'plugin:react/recommended',
    env: {
        browser: true,
        es6: true,
        node: true
    },
    rules: {
        'react/jsx-uses-react': 2,
        'react/jsx-uses-vars': 2,
        eqeqeq: [2, 'allow-null'],
        'no-var': 2,
        'no-case-declarations': 0,
        'react/prop-types': 0
    },
    parser: 'babel-eslint',
    plugins: [
        'react'
    ]
};
