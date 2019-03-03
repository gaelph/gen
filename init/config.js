const type = require('ggen')

module.exports = {
  init: {
    params: {},
    tree: {
      ".ggen": {
        "templates": {
          "index.js.hbs": "index.js.hbs"
        },
        "config.js": "config.js.hbs"
      }
    }
  }
}