const fs = require('fs')
const path = require('path')
const commandLineArgs = require('command-line-args')


const Handlebars = require('handlebars')
const helpers = require('handlebars-helpers')
Handlebars.registerHelper(helpers.string())

function loadConfig({ GEN_PATH }) {
  GEN_PATH = GEN_PATH || path.join(process.cwd(), '.gen')

  const config = require(path.join(GEN_PATH, 'config.js'))

  const TEMPLATES_PATH = path.join(GEN_PATH, 'templates')

  return { config, TEMPLATES_PATH }
}

function pickConfig(config, argv) {
  var tree, vars, params
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

function getVars(params, argv) {
  const optionsDefinition = Object.entries(params).map(([name, type]) => {
    return { name, alias: name.charAt(0), type }
  })

  // Get context from command line args
  return commandLineArgs(optionsDefinition, { argv })
}

function isDirectory(candidate) {
  return typeof candidate !== "string"
}

function render(template, vars) {
  return Handlebars.compile(template)(vars)
}

function getDirPath(parent, key, vars) {
  let dirPath = path.join(parent, key)

  return render(dirPath, vars)
}

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
}

function createFile(TEMPLATES_PATH, parent, file, template, vars) {
  const templatePath = path.join(TEMPLATES_PATH, template)

  const contents = fs.readFileSync(templatePath).toString("utf8")

  let filePath = path.join(parent, file)
  filePath = render(filePath, vars)
  const rendered = render(contents, vars)

  console.log('Created file', filePath)

  fs.writeFileSync(filePath, Buffer.from(rendered))
}

// Recursive function to create the directory structure
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

function run(argv, env) {
  // Load configs
  const { config, TEMPLATES_PATH } = loadConfig(env)


  // Pick the proper config
  // TODO: handle error case
  const { tree, vars } = pickConfig(config, argv)



  mkDirTree(TEMPLATES_PATH, vars, tree)
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