# gGen [![NPM version](https://badge.fury.io/js/ggen.svg)](https://npmjs.org/package/ggen) ![Tests](https://img.shields.io/badge/tests-20%2F20-brightgreen.svg) ![Coverage](https://img.shields.io/badge/coverage-99%25-brightgreen.svg)
> A directory structure and file generator.

gGen allows you to easily create template directory structures and template files for your project.

You can generate any kind of files
- Java classes, interfaces...
- Golang files
- React Components
- Redux Reducers
- Redux Sagas
- `index.js` files based on directory content
- CSS
- HTML
- And many more !

## Install

```shell
# Local install
npm i -D ggen
```
```sh
# Global install
npm i -g ggen

# In each project directory
npm link ggen
```
Create default configuration:
```sh
# From your project directory
ggen init
```

## Usage
After you've edited your configuration:
```
ggen <command> [opts]
```
`<command>` and `[opts]` depend on your config files, see below.

## Examples
Look in the `.ggen` directory of this project to have more complete examples.

## Configuration
By default, `ggen` looks for its configuration in `.ggen/` in the current working directory.
You can override this path with the `GGEN_PATH` environnement variable.

`.ggen` structure:
```
.ggen
├── templates/  -- Handlebars template files for file generation
└── config.js   -- Main configuration file
```

File generation uses Handlebars templates located at `<GGEN_PATH>/templates`.

### Simple example
Let's say you want to automate the process of creating a nodejs module, using
the following structure:
```
<module name>/
└── index.js
```

Where `index.js` exports a single function.
#### Template and config files
 - `.ggen/templates/index.js.hbs`
    ```handlebars
    module.exports = function {{ module_name }}() {

    }
    ```

 - `.ggen/config.js`
    ```js
    const type = require('ggen')

    module.exports = {
      // adds the "module" command to the ggen cli
      module: {
        params: {
          // adds the --module_name option the ggen cli
          // adds a "module_name" variable to the template's context
          module_name: type.String() // function to parse the command line input
        },
        // will create a directory named after the "module_name" cli option,
        // containing an index.js file based on the index.js.hbs template
        tree: {
          "{{module_name}}": {
            "index.js": "index.js.hbs"
          }
        }
      }
    }
    ```

#### Generating an `example` module
To generate the `example` module, simply call:
```shell
ggen module --module_name example
```

It will create the following structure in your current working directory:
```
example/
└── index.js
```

`example/index.js`:
```js
module.exports = function example() {

}
```

### Parameter types
> **NOTICE**
> If you have installed `ggen` globally, you will need to link it to your project to use included type parsers.
>`npm link ggen`

Start your config file with:
```js
const type = require('ggen')
// type.String()
// type.Array()
// type.Map()
// ...
```

#### `type.String()`, `type.Number()`, `type.Boolean()`
Parses the input into either a String, Number, or Boolean types

#### `type.Array(separator = ",")`
Parses the input into an array of strings.

```js
// config.js
const example = {
  tree: {
    // directory structure
  }
  params: {
    list: type.Array()
  }
}
```

```shell
# genaration command
ggen example --list apple,banana,orange
```

```js
// Resulting template context
{
  "list": [ "apple", "banana", "orange" ]
}
```

#### `type.Map(entrySeparator = ",", keyValueSeparator ":")`
Parses the input into an object.

```js
// config.js
const example = {
  tree: {
    // directory structure
  }
  params: {
    properties: type.Map()
  }
}
```

```shell
# genaration command
ggen example --properties email:null,isOk:true
```

```js
// Resulting template context
{
  "properties": {
    "email": "null",
    "isOk": "true"
  }
}
```