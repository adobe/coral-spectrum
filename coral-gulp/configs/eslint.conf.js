module.exports = {
  "extends": "standard",
  "env": {
    "browser": true,
    "es6": true
  },
  "rules": {
    "brace-style": ["warn", "stroustrup", {"allowSingleLine": true}],
    "operator-linebreak": ["error", "after"],
    "semi": [2, "always"],
    "complexity": ["warn", 15],
    "max-depth": 1,
    "max-lines": 0,
    "no-trailing-spaces": 0,
    "space-before-function-paren": 0,
    "no-mixed-operators": 0,
    "object-curly-spacing": 0,
    "babel/object-curly-spacing": 0,
    "array-bracket-spacing": 0,
    "object-shorthand": 0
  },
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  }
};
