#!/usr/bin/env node

const { run, run_init } = require('../runtime')

switch (process.argv[2]) {
  case "init":
    run_init(process.argv)
    break;

  default:
    run(process.argv, process.env)
}