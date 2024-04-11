export default {
  rules: {
    semi: [
      'error',
      'always'
    ],
    'operator-linebreak': [
      'off',
      'none'
    ],
    'comma-dangle': [
      'error',
      'never'
    ],
    'brace-style': [
      'error',
      '1tbs'
    ],
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1
      }
    ],
    'max-len': [
      'error',
      {
        code: 280
      }
    ],
    'id-blacklist': 'off',
    'id-match': 'off',
    'space-before-function-paren': 'off',
    'no-underscore-dangle': 'off',
    'no-shadow': 'off',
    'eol-last': 'off'
  }
};
