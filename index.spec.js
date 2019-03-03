const type = require('./index')

describe("Type parsers", function () {
  it("parses a string", () => {
    const parse = type.String()

    expect(parse("string")).toEqual("string")
  })

  it("parses a number", () => {
    const parse = type.Number()

    expect(parse("12")).toEqual(12)
  })

  it("parses a boolean", () => {
    const parse = type.Boolean()

    expect(parse("true")).toBe(true)
    expect(parse("false")).toBe(false)
    expect(parse("any")).toBe(true)
    expect(parse()).toBe(false)
  })

  it("parses an array with default separator", () => {
    const parse = type.Array()

    const result = parse("apple,banana,orange")
    const expected = ["apple", "banana", "orange"]

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toEqual(expected.length)
    expected.forEach(item => {
      expect(result).toContain(item)
    })
  })

  it("parses an array with quotes with default separator", () => {
    const parse = type.Array()

    const result = parse("\"apple,banana,orange\"")
    const expected = ["apple", "banana", "orange"]

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toEqual(expected.length)
    expected.forEach(item => {
      expect(result).toContain(item)
    })
  })

  it("parses an array with custom separator", () => {
    const parse = type.Array("|")

    const result = parse("apple|banana|orange")
    const expected = ["apple", "banana", "orange"]

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toEqual(expected.length)
    expected.forEach(item => {
      expect(result).toContain(item)
    })
  })

  it("parses a map", () => {
    const parse = type.Map()

    const result = parse("apple:true,banana:false,orange:true")
    const expected = {
      apple: "true",
      banana: "false",
      orange: "true"
    }

    expect(result).toMatchObject(expected)
  })

  it("parses a map with quotes", () => {
    const parse = type.Map()

    const result = parse("\"apple:true,banana:false,orange:true\"")
    const expected = {
      apple: "true",
      banana: "false",
      orange: "true"
    }

    expect(result).toMatchObject(expected)
  })

  it("parses a map with custom separators", () => {
    const parse = type.Map("|", "->")

    const result = parse("apple->true|banana->false|orange->true")
    const expected = {
      apple: "true",
      banana: "false",
      orange: "true"
    }

    expect(result).toMatchObject(expected)
  })
})