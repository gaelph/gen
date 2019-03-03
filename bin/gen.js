#!/usr/bin/env node

const { run, run_init, refresh_ggen } = require('../runtime')

switch (process.argv[2]) {
  case "init":
    run_init(process.argv)
    break;

  case "refresh":
    refresh_ggen(process.argv)

  default:
    run(process.argv, process.env)
}