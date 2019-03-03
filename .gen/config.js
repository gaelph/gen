const type = require('gen')

module.exports = {
  // adds the "module" command to the gen cli
  module: {
    params: {
      // adds the --module_name option the gen cli
      // adds a "module_name" variable to the template's context
      module_name: type.String() // function to parse the command line input
    },
    // will create a directory with the named after the "module_name" cli option,
    // containing an index.js file based on the index.js.hbs template
    tree: {
      "{{module_name}}": {
        "index.js": "index.js.hbs"
      }
    }
  }
}