const commandLineArgs = require('command-line-args')

const fs = require('fs')
const path = require('path')

const Handlebars = require('handlebars')
const helpers = require('handlebars-helpers')
Handlebars.registerHelper(helpers.string())

// Load configs
const GEN_PATH = process.env.GEN_PATH || path.join(process.cwd(), '.gen')
const CONFIG_PATH = path.join(GEN_PATH, 'config')
const TEMPLATES_PATH = path.join(GEN_PATH, 'templates')
const config = require(path.resolve(CONFIG_PATH))

// Decide which template to follow
const mainDefinitions = [
  { name: 'command', defaultOption: true }
]

const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true })
const argv = mainOptions._unknown || []

// Pick the proper config
// TODO: handle error case
const tree = config[mainOptions.command].tree
const params = config[mainOptions.command].params

// Build command line parser from config
const optionsDefinition = Object.entries(params).map(([name, type]) => {
  return { name, alias: name.charAt(0), type }
})

// Get context from command line args
const vars = commandLineArgs(optionsDefinition, { argv })

console.log(`Generating a ${mainOptions.command} with ${JSON.stringify(vars)}`)

// Recursive function to create the directory structure
const mkDirTree = (dir, parent = process.cwd()) => {
  const dirNames = Object.keys(dir)

  dirNames.forEach(dirName => {
    let dirPath = path.join(parent, dirName)
    dirPath = Handlebars.compile(dirPath)(vars)

    if (!fs.existsSync(dirPath) && !dir[dirName].hasOwnProperty('template')) {
      fs.mkdirSync(dirPath)
    }

    const subTree = dir[dirName]

    if (!subTree.hasOwnProperty('template')) {
      mkDirTree(subTree, dirPath)
    }
    else {

      const templatePath = path.join(TEMPLATES_PATH, subTree.template + '.hbs')

      const contents = fs.readFileSync(templatePath).toString("utf8")

      let filePath = path.join(parent, dirName)
      filePath = Handlebars.compile(filePath)(vars)
      const rendered = Handlebars.compile(contents)(vars)

      console.log('Created file', filePath)

      fs.writeFileSync(filePath, Buffer.from(rendered))
    }
  })
}

// Build the directory structure
mkDirTree(tree)
