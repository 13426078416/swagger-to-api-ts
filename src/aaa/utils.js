import { getJsdoc } from "./utilities/jsdoc";

function getPathParams(parameters) {
  return (
    parameters.filter(({ In }) => {
      return In === "path";
    }) || []
  );
}

function getHeaderParams(parameters, config) {
  return getParams(
    parameters,
    "header",
    config.ignore && config.ignore.headerParams
  );
}

function getParams(parameters, type, ignoreParams) {
  const queryParamsArray =
    parameters.filter(({ In, name }) => {
      return In === type && !ignoreParams.includes(name);
    }) || [];

  const params = getObjectType(queryParamsArray);

  return {
    params,
    hasNullable: queryParamsArray.every(({ schema = {} }) => schema.nullable),
  };
}

function toPascalCase(str) {
  return `${str.substring(0, 1).toUpperCase()}${str.substring(1)}`;
}
function replaceWithUpper(str, sp) {
  let pointArray = str.split(sp);
  pointArray = pointArray.map((point) => toPascalCase(point));

  return pointArray.join("");
}

function generateServiceName(endPoint, method, operationId, config) {
  const { methodName, methodParamsByTag, prefix = "" } = config;

  const _endPoint = endPoint.replace(new RegExp(`^${prefix}`, "i"), "");
  let endPointArr = _endPoint.split("/");
  let paramsCount = 0;
  endPointArr = endPointArr.map((value) => {
    if (value.includes("{")) {
      return methodParamsByTag
        ? `P${paramsCount++}`
        : toPascalCase(value.replace("{", "").replace("}", ""));
    }

    return replaceWithUpper(value, "-");
  });
  const path = endPointArr.join("");

  const methodNameTemplate = getTemplate(methodName, operationId);

  const serviceName = template(methodNameTemplate, {
    path,
    method,
    ...(operationId ? { operationId } : {}),
  });
  return serviceName;
}

function getTemplate(methodName, operationId) {
  const defaultTemplate = "{method}{path}";
  if (!methodName) {
    return defaultTemplate;
  }

  const hasMethodNameOperationId = /(\{operationId\})/i.test(methodName);

  if (hasMethodNameOperationId) {
    return operationId ? methodName : defaultTemplate;
  }

  return methodName;
}

const TYPES = {
  integer: "number",
  number: "number",
  boolean: "boolean",
  object: "object",
  string: "string",
  array: "array",
};

function getDefineParam(name, required = false, schema, description) {
  return getParamString(name, required, getTsType(schema), description);
}

function getParamString(name, required = false, type, description, isPartial) {
  return `${getJsdoc({
    description,
  })}${name}${required ? "" : "?"}: ${isPartial ? `Partial<${type}>` : type}`;
}

function getTsType(schema) {
  if (isTypeAny(schema)) {
    return "any";
  }

  const {
    type,
    $ref,
    enum: Enum,
    items,
    properties,
    oneOf,
    additionalProperties,
    required,
    allOf,
  } = schema;

  if ($ref) {
    const refArray = $ref.split("/");
    if (refArray[refArray.length - 2] === "requestBodies") {
      return `RequestBody${getRefName($ref)}`;
    } else {
      return getRefName($ref);
    }
  }
  if (Enum) {
    return `${Enum.map((t) => `"${t}"`).join(" | ")}`;
  }

  if (items) {
    return `${getTsType(items)}[]`;
  }

  let result = "";

  if (properties) {
    result += getObjectType(
      Object.entries(properties).map(([pName, _schema]) => ({
        schema: {
          ..._schema,
          nullable:
            required && required.find((name) => name === pName)
              ? false
              : _schema.nullable !== undefined
              ? _schema.nullable
              : true,
        },
        name: pName,
      }))
    );
  }

  if (oneOf) {
    result = `${result} & (${oneOf
      .map((t) => `(${getTsType(t)})`)
      .join(" | ")})`;
  }

  if (allOf) {
    result = `${result} & (${allOf
      .map((_schema) => getTsType(_schema))
      .join(" & ")})`;
  }

  if (type === "object" && !result) {
    if (additionalProperties) {
      return `{[x: string]: ${getTsType(additionalProperties)}}`;
    }

    return "{[x in string | number ]: any}";
  }

  return result || TYPES[type];
}

function getObjectType(parameter) {
  const object = parameter
    .sort(
      (
        { name, schema: { nullable } = {} },
        { name: _name, schema: { nullable: _nullable } = {} }
      ) => {
        if (!nullable && _nullable) {
          return -1;
        } else if (nullable && !_nullable) {
          return 1;
        }

        return isAscending(name, _name);
      }
    )
    .reduce(
      (
        prev,
        {
          schema: {
            deprecated,
            "x-deprecatedMessage": deprecatedMessage,
            example,
            nullable,
          } = {},
          schema,
          name,
        }
      ) => {
        return `${prev}${getJsdoc({
          ...schema,
          deprecated:
            deprecated || deprecatedMessage ? deprecatedMessage : undefined,
          example,
        })}"${name}"${nullable ? "?" : ""}: ${getTsType(schema)};`;
      },
      ""
    );

  return object ? `{${object}}` : "";
}
function getSchemaName(name) {
  const removeDot = replaceWithUpper(name, ".");
  const removeBackTick = replaceWithUpper(removeDot, "`");
  const removeFirstBracket = replaceWithUpper(removeBackTick, "[");
  const removeLastBracket = replaceWithUpper(removeFirstBracket, "]");
  return removeLastBracket;
}

function getRefName($ref) {
  const parts = $ref.split("/").pop();
  return getSchemaName(parts || "");
}

function isAscending(a, b) {
  if (a > b) {
    return 1;
  }
  if (b > a) {
    return -1;
  }
  return 0;
}

function getParametersInfo(parameters = [], type) {
  const params =
    parameters.filter(({ in: In }) => {
      return In === type;
    }) || [];

  return {
    params,
    exist: params.length > 0,
    isNullable: params.every(({ schema }) => schema.nullable),
  };
}

function majorVersionsCheck(expectedV, inputV) {
  if (!inputV) {
    throw new Error(
      `Swagger-Typescript working with openApi v3/ swagger v2, seem your json is not openApi openApi v3/ swagger v2`
    );
  }

  const expectedVMajor = expectedV.split(".")[0];
  const inputVMajor = inputV.split(".")[0];
  function isValidPart(x) {
    return /^\d+$/.test(x);
  }
  if (!isValidPart(expectedVMajor) || !isValidPart(inputVMajor)) {
    throw new Error(
      `Swagger-Typescript working with openApi v3/ swagger v2 your json openApi version is not valid "${inputV}"`
    );
  }

  const expectedMajorNumber = Number(expectedVMajor);
  const inputMajorNumber = Number(inputVMajor);

  if (expectedMajorNumber <= inputMajorNumber) {
    return;
  }

  throw new Error(
    `Swagger-Typescript working with openApi v3/ swagger v2 your json openApi version is ${inputV}`
  );
}

function isTypeAny(type) {
  if (type === true) {
    return true;
  }

  if (typeof type === "object" && Object.keys(type).length <= 0) {
    return true;
  }

  if (!type || type.AnyValue) {
    return true;
  }

  return false;
}

/** Used to replace {name} in string with obj.name */
function template(str, obj = {}) {
  Object.entries(obj).forEach(([key, value]) => {
    const re = new RegExp(`{${key}}`, "i");
    str = str.replace(re, value);
  });

  const re = new RegExp("{*}", "g");
  if (re.test(str)) {
    throw new Error(`methodName: Some A key is missed "${str}"`);
  }
  return str;
}

function isMatchWholeWord(stringToSearch, word) {
  return new RegExp("\\b" + word + "\\b").test(stringToSearch);
}

export {
  majorVersionsCheck,
  getPathParams,
  getHeaderParams,
  generateServiceName,
  getTsType,
  getRefName,
  isAscending,
  getDefineParam,
  getParamString,
  getParametersInfo,
  isTypeAny,
  template,
  toPascalCase,
  getSchemaName,
  isMatchWholeWord,
};
