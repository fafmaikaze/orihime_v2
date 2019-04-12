module.exports = {
  'extends': 'airbnb',
  'parser': 'babel-eslint',
  'rules': {
    'no-underscore-dangle': ['off'],
    'prefer-rest-params': ['off'],
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'max-len': ['error', 120, 2, { 'ignoreComments': true, 'ignoreRegExpLiterals': true }],
    'react/jsx-filename-extension':
      [1, { 'extensions': ['.js', '.jsx'] }],
    'allowForLoopAfterthoughts': 0,
    'jsx-a11y/href-no-hash': 'off',
    'jsx-a11y/anchor-is-valid':
      ['warn', { 'aspects': ['invalidHref'] }],
    'no-console': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/mouse-events-have-key-events': 'off',
    'implicit-arrow-linebreak': 'off', // workaround for implicit-arrow-linebreak not found
    'import/no-named-as-default-member': 'off',
  }
};
