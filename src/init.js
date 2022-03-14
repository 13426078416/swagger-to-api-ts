#!/usr/bin/env node
import Axios from "axios";
import yaml from "js-yaml";
import fs from "fs-extra";
import converter from "swagger2openapi";
import chalk from "chalk";
import { generator } from "./aaa/generator";
import prettier from "prettier";
export const defaultPrettierConfig = {
  parser: "typescript",
  trailingComma: "all",
  printWidth: 100,
  arrowParens: "always",
  jsxBracketSameLine: false,
  endOfLine: "lf",
  proseWrap: "always",
};
export function prettierContent(params) {
  return prettier.format(params, defaultPrettierConfig);
}

function replaceComponents(input, newJson, refs) {
  const components = {
    ...(input.components || {}),
  };

  ["schemas", "requestBodies", "parameters"].map((key) => {
    if (newJson.components[key]) {
      Object.entries(newJson.components[key]).forEach(([name, schema]) => {
        if (refs.includes(name)) {
          if (!components[key]) {
            components[key] = {
              ...((input.components && input.components[key]) || {}),
            };
          }
          components[key][name] = schema;
        }
      });
    }
  });

  return components;
}

function findRefs(obj) {
  if (typeof obj !== "object") {
    return [];
  }

  if (Array.isArray(obj)) {
    return obj.flatMap((value) => {
      return findRefs(value);
    });
  }

  return Object.entries(obj).flatMap(([key, value]) => {
    if (key === "$ref") {
      return [value.replace(/#\/components\/[\w]+\//g, "")];
    }
    return findRefs(value);
  });
}

function findRelatedRef(newJson, refs) {
  try {
    ["schemas", "requestBodies", "parameters"].map((key) => {
      if (newJson.components[key]) {
        Object.entries(newJson.components[key]).forEach(([name, schema]) => {
          if (refs.includes(name)) {
            const schemaRefs = findRefs(schema);

            const newRefs = schemaRefs.filter((ref) => !refs.includes(ref));

            if (newRefs.length > 0) {
              refs = findRelatedRef(newJson, [...refs, ...newRefs]);
            }
          }
        });
      }
    });
  } catch (error) {
    chalk.red(error);
  }

  return refs;
}
function partialUpdateJson(input = { paths: [] }, newJson, tag) {
  let refs = [];

  const filteredPaths = Object.fromEntries(
    Object.entries(input.paths).map(([name, value]) => [
      name,
      Object.fromEntries(
        Object.entries(value).filter(
          ([_, { tags }]) => !tags.find((item) => tag.find((i) => i === item))
        )
      ),
    ])
  );

  const paths = { ...filteredPaths };
  Object.entries(newJson.paths).forEach(([endPoint, value]) => {
    Object.entries(value).forEach(([method, options]) => {
      if (typeof options !== "object") {
        return;
      }

      //   if (tag.find((t) => options.tags.includes(t))) {
      refs = refs.concat(findRefs(options));

      if (!paths[endPoint]) {
        paths[endPoint] = {
          ...newJson.paths[endPoint],
        };
      }
      paths[endPoint][method] = options;
      //   }
    });
  });

  refs = findRelatedRef(newJson, refs);

  const components = replaceComponents(input, newJson, refs);

  return {
    ...input,
    paths,
    components,
  };
}

function swaggerToOpenApi(input) {
  const options = {};
  options.patch = true; // fix up small errors in the source definition
  options.warnOnly = true; // Do not throw on non-patchable errors
  return new Promise((resolve, reject) => {
    converter.convertObj(input, options, function (err, result) {
      if (err) {
        reject(err);
        return;
      }
      resolve(result.openapi);
    });
  });
}
export class Generate {
  constructor() {
    const configs = JSON.parse(
      fs.readFileSync("swagger.config.json").toString()
    ).data;
    configs.forEach((ele) => this.init(ele));
  }

  async init(config) {
    this.path = process.cwd();
    let { data: content } = await Axios.get(config.url);
    if (typeof content !== "object") {
      content = yaml.load(content);
    }
    let input = await swaggerToOpenApi(content);
    input = partialUpdateJson({ paths: [] }, input, []);
    const { code, type } = generator(input, config);
    fs.outputFileSync(
      `${config.dir}/api/${config.name}.ts`,
      prettierContent(code)
    );
    console.log(chalk.yellowBright("services Completed"));

    fs.outputFileSync(
      `${config.dir}/interface/${config.name}.ts`,
      prettierContent(type)
    );
    console.log(chalk.yellowBright("types Completed"));
  }
}

const a = new Generate();
