# Gen
A directory structure and file generator.

## Install
```shell
npm i -g gen
```

## Usage
```
gen <command> [opts]
```
`<command>` and `[opts]` depend on your config files, see below.

## Examples
Look in the `.gen` directory of this project to have more complete examples.

## Configuratiom
By default, `gen` looks for its configuration in a `.gen` directory
in the current working directory.
You can override this path with the `GEN_PATH` environnement variable.

`.gen` structure:
```
.gen
├── templates/  -- Handlebars template files for file generation
└── config.js   -- Main configuration file
```

File generation uses Handlebars templates located at `<GEN_PATH>/templates`.
Template files must have the `.hbs` extension.

### Simple example
Let's say you want to automate the process of creating a nodejs module, using
the following structure:
```
<module name>/
└── index.js
```

Where `index.js` exports a single function.
#### Template and config files
 - `.gen/templates/index.js.hbs`
    ```handlebars
    module.exports = function {{ module_name }}() {

    }
    ```

 - `.gen/config.js`
    ```javascript
    module.exports = {
      // adds the "module" command to the gen cli
      module: {
        params: {
          // adds the --module_name option the gen cli
          // adds a "module_name" variable to the template's context
          module_name: String // function to parse the command line input
        },
        // will create a directory with the named after the "module_name" cli option,
        // containing an index.js file based on the index.js.hbs template
        tree: {
          "{{module_name}}": {
            "index.js": {
              template: "index.js"
            }
          }
        }
      }
    }
    ```

#### Result
To generate a new module, simple call:
```shell
gen module --module_name example
```

It will result in creating the following structure in your current working directory:
```
example/
└── index.js
```

`example/index.js`
```javascript
module.exports = function example() {

}
```