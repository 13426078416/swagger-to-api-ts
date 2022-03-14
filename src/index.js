#!/usr/bin/env node
import { Command } from "commander";
// import dedent from "dedent";
// import { log } from "@luban-cli/cli-shared-utils";

import { Generate, init } from "./init";
// import { Generator } from "./generator";

const program = new Command();

console.log("test");
// eslint-disable-next-line import/no-commonjs
program
  .version(`luban-ts-service ${require("../package.json").version}`)
  .usage("<command>");

program
  .command("init")
  .description("generate config file")
  .action(() => {
    init();
  });

program
  .command("gen")
  .description("generate interface")
  .action(() => {
    const generate = new Generate();
  });

program
  .command("create_entry <name>")
  .description("generate json data file")
  .action((name) => {
    const generate = new Generate();
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
