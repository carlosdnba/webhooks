module.exports = {
  env: {
    commonjs: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'class-methods-use-this': 'off',
    'consistent-return': 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-empty': 'off',
    'arrow-parens': 'off',
    'import/prefer-default-export': 'off',
    camelcase: 'off',
    'object-curly-newline': [
      'error',
      {
        ObjectPattern: { multiline: true, minProperties: 6 },
      },
    ],
  },

};
