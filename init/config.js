const type = require('ggen')
const path = require('path')
const fs = require('fs')

module.exports = {
  init: {
    params: {},
    tree: {
      ".ggen": {
        "templates": {
          "index.js.hbs": "index.js.hbs"
        },
        "module.config.js": "module.config.js.hbs"
      }
    }
  },
  refresh: {
    params: {
      configs: () => {
        return fs.readdirSync(path.join(process.cwd(), '.ggen'))
          .filter(c => c.endsWith('.config.js'))
          .map(c => c.replace('.config.js', ''))
      }
    },
    tree: {
      ".ggen": {
        "config.js": "config.js.hbs"
      }
    }
  }
}