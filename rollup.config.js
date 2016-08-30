import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'

const pkg = require('./package.json')

export default {
  entry: 'index.js',
  plugins: [ buble(), uglify() ],
  targets: [
    {
      dest: pkg.main,
      format: 'umd',
      moduleName: '$asyncRender',
      sourceMap: true
    }
  ]
}
