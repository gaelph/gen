/* istanbul ignore next */
function trimStart(string, char = /\s/) {
  const r = new RegExp(char)
  while (string.length > 0 && r.test(string.charAt(0))) {
    string = string.substring(1)
  }

  return string
}

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

module.exports = {
  String: () => String,
  Number: () => Number,
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

  Array: (separator = ",") =>
    (input) =>
      trimEnd(trimStart(input, /["']/), /["']/)
        .split(separator)
        .map(p => p.trim()),

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