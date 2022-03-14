#!/usr/bin/env node
"use strict";

var _commander = require("commander");

var _init = require("./init");

// import { Generator } from "./generator";

var program = new _commander.Command();
// import dedent from "dedent";
// import { log } from "@luban-cli/cli-shared-utils";

console.log("test");
// eslint-disable-next-line import/no-commonjs
program.version("luban-ts-service " + require("../package.json").version).usage("<command>");

program.command("init").description("generate config file").action(function () {
  (0, _init.init)();
});

program.command("gen").description("generate interface").action(function () {
  var generate = new _init.Generate();
});

program.command("create_entry <name>").description("generate json data file").action(function (name) {
  var generate = new _init.Generate();
  generate.createEntry(name);
});

// program
//   .command("gen")
//   .description("generate interface and service functions")
//   .action(() => {
//     const generate = new Generator();
//     generate.init();
//   });

// program.on("--help", () => {
//   log();
//   log(
//     `\n${dedent`
//       # Usage
//         Initial config file: lts init
//         Generate code: lts gen
//         Check version: lts version
//         Help: lts help

//       # GitHub
//         https://github.com/LeapFE/luban-ts-service#readme
//     `}\n`
//   );
// });

program.parse(process.argv);
//# sourceMappingURL=index.js.map