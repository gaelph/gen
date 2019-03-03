const fs = require('fs')
const path = require('path')
const commandLineArgs = require('command-line-args')
const Handlebars = require('handlebars')
const helpers = require('handlebars-helpers')
Handlebars.registerHelper(helpers.string())

/**
 * Loads the configuration file.
 * Defaults to $PWD/.ggen/config.js
 * Use GGEN_PATH environnement variable to override
 *
 * Returns the config object and TEMPLATES_PATH, the absolute path
 * to the template files
 *
 * @param {object} env
 * @param {string} [env.GGEN_PATH="$PWD/.ggen"]
 * @return {{config: object, TEMPLATES_PATH: string}}
 */
function loadConfig({ GGEN_PATH }) {
  GGEN_PATH = GGEN_PATH || path.join(process.cwd(), '.ggen')

  const config = require(path.join(GGEN_PATH, 'config.js'))

  const TEMPLATES_PATH = path.join(GGEN_PATH, 'templates')

  return { config, TEMPLATES_PATH }
}

/**
 * Picks the config to use depending on command
 * @param {Object.<string, object>} config The gen config object
 * @param {string[]} argv process.argv
 * @return {{tree: Object.<string, object>, vars: Object.<string, *>}}
 * @throws {Error} If the command cannot be found in the config object
 */
function pickConfig(config, argv) {
  const mainDefinitions = [
    { name: 'command', defaultOption: true }
  ]

  const { command, _unknown } = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true, argv })
  argv = _unknown || []

  if (config.hasOwnProperty(command)) {
    var { tree, params } = config[command]
    var vars = getVars(params, argv)

    console.log(`Generating a ${command} with ${JSON.stringify(vars)}`)

    return { tree, vars }
  }

  throw new Error(`Command "${command}" doesn't exist`)
}

/**
 * Gets Context for template engine from command line arguments
 * @private
 * @param {Object.<string, (input: string) => *>} params params from the config object
 * @param {string[]} argv remained of process.argv after the command have been used
 * @return {Object.<string, *>} The context for the template engine
 */
function getVars(params, argv) {
  const optionsDefinition = Object.entries(params).map(([name, type]) => {
    return { name, alias: name.charAt(0), type }
  })

  return commandLineArgs(optionsDefinition, { argv })
}

/**
 * Tells if a node in the tree represents a directory or a file to render
 * @private
 * @param {object|string} candidate
 * @return {Boolean}
 */
function isDirectory(candidate) {
  return typeof candidate !== "string"
}

/**
 * Uses a template engine to render a file or file name
 * @private
 * @param {string} template
 * @param {Object.<string, *>} vars context information
 */
function render(template, vars) {
  return Handlebars.compile(template)(vars)
}

/**
 * Uses the template engine to render a file or directory path to create
 * @private
 * @param {string} parent Parent directory of the file
 * @param {string} key    template for the filename
 * @param {Object.<string, *>} vars context for the template engine
 * @return {string} rendered pathname
 */
function getDirPath(parent, key, vars) {
  let dirPath = path.join(parent, key)

  return render(dirPath, vars)
}

/**
 * Creates a directory if it doesn't exists
 * @private
 * @param {string} dirPath
 */
function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
}

/**
 * Renders a file using the template engine and writes it to the disk
 * @private
 * @param {string} TEMPLATES_PATH Path to the templates directory
 * @param {string} parent Parent directory to zrite the file into
 * @param {string} file template for the filename
 * @param {string} template template for the file contents
 * @param {Object.<string, *>} vars context for the template engine
 */
function createFile(TEMPLATES_PATH, parent, file, template, vars) {
  const templatePath = path.join(TEMPLATES_PATH, template)

  const contents = fs.readFileSync(templatePath).toString("utf8")

  let filePath = path.join(parent, file)
  filePath = render(filePath, vars)
  const rendered = render(contents, vars)

  console.log('Created file', filePath)

  fs.writeFileSync(filePath, Buffer.from(rendered))
}

/**
 * Recursive function to create the directory structure
 * @param {string} TEMPLATES_PATH Path to the templates directory
 * @param {Object.<string, *>} vars for the template engine
 * @param {Object.<string, object>} dir tree representing the directory strucuture to create
 * @param {string} [parent="$PWD"] The directory to create directories and files into
 */
function mkDirTree (TEMPLATES_PATH, vars, dir, parent = process.cwd()) {
  const children = Object.keys(dir)

  children.forEach(childName => {
    const child = dir[childName]

    if (!isDirectory(child)) {
      createFile(TEMPLATES_PATH, parent, childName, child, vars)
      return
    }

    let dirPath = getDirPath(parent, childName, vars)
    createDir(dirPath)

    mkDirTree(TEMPLATES_PATH, vars, child, dirPath)
  })
}

/**
 * Main function
 * @param {string[]} argv process.argv
 * @param {Object.<string, string>} env process.env
 */
/* istanbul ignore next */
function run(argv, env) {
  // Load configs
  const { config, TEMPLATES_PATH } = loadConfig(env)


  // Pick the proper config
  try {
    const { tree, vars } = pickConfig(config, argv)
    mkDirTree(TEMPLATES_PATH, vars, tree)
  }
  catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  loadConfig,
  pickConfig,
  getVars,
  isDirectory,
  render,
  getDirPath,
  createDir,
  createFile,
  mkDirTree,
  run
}