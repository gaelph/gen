module.exports = {
  // adds the "index" command to the gen-cli
  index: {
    // adds the --name option the gen-cli
    params: {
      name: String
    },
    // will create a directory whith the name passed as the "name" option to the
    // cli, containing an index.js file based on the index.js.hbs template
    tree: {
      "{{name}}": {
        "index.js": {
          template: "index.js"
        }
      }
    }
  }
}