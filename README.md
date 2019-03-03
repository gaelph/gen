# Gen
A directory structure and file generator.

## Install

```shell
# Local install
npm i -D gen
```
```sh
# Global install
npm i -g gen

# In each project directory
npm link gen
```

## Usage
After you've edited your configuration:
```
gen <command> [opts]
```
`<command>` and `[opts]` depend on your config files, see below.

## Examples
Look in the `.gen` directory of this project to have more complete examples.

## Configuration
By default, `gen` looks for its configuration in `.gen/` in the current working directory.
You can override this path with the `GEN_PATH` environnement variable.

`.gen` structure:
```
.gen
├── templates/  -- Handlebars template files for file generation
└── config.js   -- Main configuration file
```

File generation uses Handlebars templates located at `<GEN_PATH>/templates`.

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
    ```js
    const type = require('gen')

    module.exports = {
      // adds the "module" command to the gen cli
      module: {
        params: {
          // adds the --module_name option the gen cli
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
gen module --module_name example
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
> If you have installed `gen` globally, you will need to link it to your project to use included type parsers.
>`npm link gen`

Start your config file with:
```js
const type = require('gen')
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
gen example --list apple,banana,orange
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
gen example --properties email:null,isOk:true
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