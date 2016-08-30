const pkg = require('./package.json')

export default {
  entry: 'index.js',
  targets: [
    {
      dest: pkg['jsnext:main'],
      format: 'es',
      sourceMap: true
    }
  ]
}
