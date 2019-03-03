/**
 * Trims a string of its leading characters
 * @param {string} string The string to trim
 * @param {RegExp|string} char The chars to remove from the string
 * @return {string}
 * @example
 * const result = trimStart("___thing", "_")
 * assert(result == "thing")
 */
/* istanbul ignore next */
function trimStart(string, char = /\s/) {
  const r = new RegExp(char)
  while (string.length > 0 && r.test(string.charAt(0))) {
    string = string.substring(1)
  }

  return string
}

/**
 * Trims a string of its trailing characters
 * @param {string} string The string to trim
 * @param {RegExp|string} char The chars to remove from the string
 * @return {string}
 * @example
 * const result = trimEnd("thing___", "_")
 * assert(result == "thing")
 */
/* istanbul ignore next */
function trimEnd(string, char = /\s/) {
  const r = new RegExp(char)
  let lastChar = string.charAt(string.length - 1)

  while (string.length > 0 && r.test(lastChar)) {
    string = string.substring(0, string.length - 1)
    lastChar = string.charAt(string.length - 1)
  }

  return string
}

/**
 * @module type
 */
module.exports = {
  /**
   * @memberof type
   * Returns a function to parse the input as a string
   * @return {(input: string) => string}
   * @example
   * const parser = type.String()
   * assert(typeof parser("thing") == 'string')
   */
  String: () => String,
  /**
   * Returns a function to parse the input as a number
   * @return {(input: string) => number}
   * @example
   * const parser = type.Number()
   * assert(parser("12") == 12)
   * assert(isNaN("nan"))
   */
  Number: () => Number,
  /**
   * Returns a function to parse the input as a boolean
   * @return {(input: string) => boolean}
   * @example
   * const parser = type.Boolean()
   * assert(parser("true") == true)
   * assert(parser("false") == false)
   * assert(parser("truthy") == true)
   * assert(parser() == false)
   */
  Boolean: () => (input) => {
    switch (input) {
      case "true":
        return true

      case "false":
        return false

      default:
        return Boolean(input)
    }
  },

  /**
   * Returns a function to parse the input as an array of strings
   * @param {string} [separator=","]
   * @return {(input: string) => string[]}
   * @example
   * const parser = type.Array()
   * assert(parser("apple,banana,oranges") == ["apple", "banana", "oranges"])
   * assert(parser("apple, banana, oranges") == ["apple", "banana", "oranges"])
   * assert(parser("\"apple, banana, oranges\"") == ["apple", "banana", "oranges"])
   */
  Array: (separator = ",") =>
    (input) =>
      trimEnd(trimStart(input, /["']/), /["']/)
        .split(separator)
        .map(p => p.trim()),

  /**
   * Returns a function to parse the input as a map
   * @param {string} [entrySeparator=","]
   * @param {string} [keyValueSeparator=":"]
   * @return {(input: string) => Object.<string, string>}
   * @example
   * const parser = type.Map()
   * assert(parser("apple:true,banana:false,oranges:true") ==  {"apple": "true", "banana": "false", "oranges": "true" })
   * assert(parser("apple:true, banana:false, oranges:true") ==  {"apple": "true", "banana": "false", "oranges": "true" })
   * assert(parser("\"apple:true, banana:false, oranges:true\"") ==  {"apple": "true", "banana": "false", "oranges": "true" })
   */
  Map: (entrySeparator = ",", keyValueSeparator = ":") =>
    (input) =>
      trimEnd(trimStart(input, /["']/), /["']/)
        .split(entrySeparator)
        .map(p => p.trim())
        .reduce((map, entry) => {
          const [key, value] = entry.split(keyValueSeparator).map(p => p.trim())
          map[key] = value

          return map
        }, {})
}