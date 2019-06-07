const runtime = require('./runtime')
const path = require('path')
const fs = require('fs')
const type = require('./index')
const rfs = jest.requireActual('fs')

const indexTemplate = rfs.readFileSync('.ggen/templates/index.js.hbs')


jest.mock('fs')
jest.setTimeout(15000)

describe("Runtime", () => {

  it("loads the config file", () => {
    const { config, TEMPLATES_PATH } = runtime.loadConfig(process.env)

    expect(typeof config).toEqual("object")
    expect(config).toMatchObject({
      module: {
        params: {
          module_name: type.String()
        },
        tree: {
          "{{module_name}}": {
            "index.js": "index.js.hbs"
          }
        }
      }
    })

    expect(TEMPLATES_PATH).toEqual(path.join(process.cwd(), '.ggen', 'templates'))
  })

  it("gets vars from the command line", () => {
    const argv = ["--module_name", "test"]
    const params = {
      module_name: type.String()
    }

    const vars = runtime.getVars(params, argv)

    expect(vars).toMatchObject({
      module_name: "test"
    })

  })

  it("picks the config", () => {
    const { config } = runtime.loadConfig(process.env)
    const argv = ["module", "--module_name", "test"]

    const { tree, vars } = runtime.pickConfig(config, argv)

    expect(vars).toMatchObject({
      module_name: "test"
    })

    expect(tree).toMatchObject({
      "{{module_name}}": {
        "index.js": "index.js.hbs"
      }
    })
  })

  it("throws if command is not found in config", () => {
    const badCall = () => {
      const { config } = runtime.loadConfig(process.env)
      const { params, tree } = runtime.pickConfig(config, ["badCommand"])
    }

    expect(badCall).toThrowError(new Error(`Command "badCommand" doesn't exist`))
  })

  it("tells if next is directory", () => {
    const dir = {
      "file.js": "file.js.hbs"
    }

    expect(runtime.isDirectory(dir)).toBe(true)
    expect(runtime.isDirectory(dir["file.js"])).toBe(false)
  })

  it("renders Handlebars template", () => {
    const result = runtime.render("{{test}}!!", { test: "success" })

    expect(result).toEqual("success!!")
  })

  it("renders a directory path that's a template", () => {
    const result = runtime.getDirPath(process.cwd(), "{{dir_name}}", { dir_name: "test" })

    expect(result).toEqual(path.join(process.cwd(), 'test'))
  })

  it("creates a directory if it doesn't exists", () => {
    fs.existsSync.mockName('not exists')

    runtime.createDir('fake_dir')
    expect(fs.mkdirSync).toBeCalledWith('fake_dir')
  })

  it("doesn't create a directory if it exists", () => {
    fs.existsSync.mockName('exists')

    runtime.createDir('.ggen')
    expect(fs.mkdirSync.mock.calls).not.toContain('.ggen')
  })

  it("creates a file", () => {
    const TEMPLATES_PATH = '.ggen/templates'
    const parent = process.cwd()
    const file = 'index.js'
    const template = 'index.js.hbs'
    const vars = {
      module_name: 'test'
    }

    fs.readFileSync = jest.fn().mockReturnValue(indexTemplate)
    const expected = Buffer.from(runtime.render(indexTemplate.toString('utf8'), vars))
    let filePath = path.join(parent, file)
    filePath = runtime.render(filePath, vars)

    runtime.createFile(TEMPLATES_PATH, parent, file, template, vars)

    expect(fs.readFileSync).toBeCalledWith(path.join(TEMPLATES_PATH, template))
    expect(fs.writeFileSync).toBeCalledWith(filePath, expected)
  })

  it("creates the directory structure", () => {
    const TEMPLATES_PATH = '.ggen/templates'
    const tree = {
      "{{module_name}}": {
        "index.js": "index.js.hbs"
      }
    }
    const vars = {
      module_name: "test"
    }

    runtime.mkDirTree(TEMPLATES_PATH, vars, tree)

    expect(fs.mkdirSync).toBeCalled()
    expect(fs.writeFileSync).toBeCalled()
  })

  it('finds the path to the global node_modules', async () => {
    const modulesPath = await runtime.globalModulesRoot()

    console.log(modulesPath)
  })

  it('finds the path to the local node_modules', async () => {
    const modulesPath = await runtime.localModulesRoot()

    console.log(modulesPath)
  })

  it('loads global plugins', async () => {
    const modulesRoot = runtime.globalModulesRoot()
    let plugins = await runtime.loadPluginsFrom(modulesRoot)

    console.log(plugins)
  })

  it('loads local plugins', async () => {
    const modulesRoot = runtime.localModulesRoot()
    let plugins = await runtime.loadPluginsFrom(modulesRoot)

    console.log(plugins)
  })
})