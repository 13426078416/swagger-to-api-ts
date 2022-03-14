"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMatchWholeWord = exports.getSchemaName = exports.toPascalCase = exports.template = exports.isTypeAny = exports.getParametersInfo = exports.getParamString = exports.getDefineParam = exports.isAscending = exports.getRefName = exports.getTsType = exports.generateServiceName = exports.getHeaderParams = exports.getPathParams = exports.majorVersionsCheck = undefined;

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require("babel-runtime/core-js/object/entries");

var _entries2 = _interopRequireDefault(_entries);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _jsdoc = require("./utilities/jsdoc");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPathParams(parameters) {
  return parameters.filter(function (_ref) {
    var In = _ref.In;

    return In === "path";
  }) || [];
}

function getHeaderParams(parameters, config) {
  return getParams(parameters, "header", config.ignore && config.ignore.headerParams);
}

function getParams(parameters, type, ignoreParams) {
  var queryParamsArray = parameters.filter(function (_ref2) {
    var In = _ref2.In,
        name = _ref2.name;

    return In === type && !ignoreParams.includes(name);
  }) || [];

  var params = getObjectType(queryParamsArray);

  return {
    params: params,
    hasNullable: queryParamsArray.every(function (_ref3) {
      var _ref3$schema = _ref3.schema,
          schema = _ref3$schema === undefined ? {} : _ref3$schema;
      return schema.nullable;
    })
  };
}

function toPascalCase(str) {
  return "" + str.substring(0, 1).toUpperCase() + str.substring(1);
}
function replaceWithUpper(str, sp) {
  var pointArray = str.split(sp);
  pointArray = pointArray.map(function (point) {
    return toPascalCase(point);
  });

  return pointArray.join("");
}

function generateServiceName(endPoint, method, operationId, config) {
  var methodName = config.methodName,
      methodParamsByTag = config.methodParamsByTag,
      _config$prefix = config.prefix,
      prefix = _config$prefix === undefined ? "" : _config$prefix;


  var _endPoint = endPoint.replace(new RegExp("^" + prefix, "i"), "");
  var endPointArr = _endPoint.split("/");
  var paramsCount = 0;
  endPointArr = endPointArr.map(function (value) {
    if (value.includes("{")) {
      return methodParamsByTag ? "P" + paramsCount++ : toPascalCase(value.replace("{", "").replace("}", ""));
    }

    return replaceWithUpper(value, "-");
  });
  var path = endPointArr.join("");

  var methodNameTemplate = getTemplate(methodName, operationId);

  var serviceName = template(methodNameTemplate, (0, _extends3.default)({
    path: path,
    method: method
  }, operationId ? { operationId: operationId } : {}));
  return serviceName;
}

function getTemplate(methodName, operationId) {
  var defaultTemplate = "{method}{path}";
  if (!methodName) {
    return defaultTemplate;
  }

  var hasMethodNameOperationId = /(\{operationId\})/i.test(methodName);

  if (hasMethodNameOperationId) {
    return operationId ? methodName : defaultTemplate;
  }

  return methodName;
}

var TYPES = {
  integer: "number",
  number: "number",
  boolean: "boolean",
  object: "object",
  string: "string",
  array: "array"
};

function getDefineParam(name) {
  var required = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var schema = arguments[2];
  var description = arguments[3];

  return getParamString(name, required, getTsType(schema), description);
}

function getParamString(name) {
  var required = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var type = arguments[2];
  var description = arguments[3];
  var isPartial = arguments[4];

  return "" + (0, _jsdoc.getJsdoc)({
    description: description
  }) + name + (required ? "" : "?") + ": " + (isPartial ? "Partial<" + type + ">" : type);
}

function getTsType(schema) {
  if (isTypeAny(schema)) {
    return "any";
  }

  var type = schema.type,
      $ref = schema.$ref,
      Enum = schema.enum,
      items = schema.items,
      properties = schema.properties,
      oneOf = schema.oneOf,
      additionalProperties = schema.additionalProperties,
      required = schema.required,
      allOf = schema.allOf;


  if ($ref) {
    var refArray = $ref.split("/");
    if (refArray[refArray.length - 2] === "requestBodies") {
      return "RequestBody" + getRefName($ref);
    } else {
      return getRefName($ref);
    }
  }
  if (Enum) {
    return "" + Enum.map(function (t) {
      return "\"" + t + "\"";
    }).join(" | ");
  }

  if (items) {
    return getTsType(items) + "[]";
  }

  var result = "";

  if (properties) {
    result += getObjectType((0, _entries2.default)(properties).map(function (_ref4) {
      var _ref5 = (0, _slicedToArray3.default)(_ref4, 2),
          pName = _ref5[0],
          _schema = _ref5[1];

      return {
        schema: (0, _extends3.default)({}, _schema, {
          nullable: required && required.find(function (name) {
            return name === pName;
          }) ? false : _schema.nullable !== undefined ? _schema.nullable : true
        }),
        name: pName
      };
    }));
  }

  if (oneOf) {
    result = result + " & (" + oneOf.map(function (t) {
      return "(" + getTsType(t) + ")";
    }).join(" | ") + ")";
  }

  if (allOf) {
    result = result + " & (" + allOf.map(function (_schema) {
      return getTsType(_schema);
    }).join(" & ") + ")";
  }

  if (type === "object" && !result) {
    if (additionalProperties) {
      return "{[x: string]: " + getTsType(additionalProperties) + "}";
    }

    return "{[x in string | number ]: any}";
  }

  return result || TYPES[type];
}

function getObjectType(parameter) {
  var object = parameter.sort(function (_ref6, _ref7) {
    var name = _ref6.name,
        _ref6$schema = _ref6.schema;
    _ref6$schema = _ref6$schema === undefined ? {} : _ref6$schema;
    var nullable = _ref6$schema.nullable;
    var _name = _ref7.name,
        _ref7$schema = _ref7.schema;
    _ref7$schema = _ref7$schema === undefined ? {} : _ref7$schema;
    var _nullable = _ref7$schema.nullable;

    if (!nullable && _nullable) {
      return -1;
    } else if (nullable && !_nullable) {
      return 1;
    }

    return isAscending(name, _name);
  }).reduce(function (prev, _ref8) {
    var _ref8$schema = _ref8.schema;
    _ref8$schema = _ref8$schema === undefined ? {} : _ref8$schema;
    var deprecated = _ref8$schema.deprecated,
        deprecatedMessage = _ref8$schema["x-deprecatedMessage"],
        example = _ref8$schema.example,
        nullable = _ref8$schema.nullable,
        schema = _ref8.schema,
        name = _ref8.name;

    return "" + prev + (0, _jsdoc.getJsdoc)((0, _extends3.default)({}, schema, {
      deprecated: deprecated || deprecatedMessage ? deprecatedMessage : undefined,
      example: example
    })) + "\"" + name + "\"" + (nullable ? "?" : "") + ": " + getTsType(schema) + ";";
  }, "");

  return object ? "{" + object + "}" : "";
}
function getSchemaName(name) {
  var removeDot = replaceWithUpper(name, ".");
  var removeBackTick = replaceWithUpper(removeDot, "`");
  var removeFirstBracket = replaceWithUpper(removeBackTick, "[");
  var removeLastBracket = replaceWithUpper(removeFirstBracket, "]");
  return removeLastBracket;
}

function getRefName($ref) {
  var parts = $ref.split("/").pop();
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

function getParametersInfo() {
  var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var type = arguments[1];

  var params = parameters.filter(function (_ref9) {
    var In = _ref9.in;

    return In === type;
  }) || [];

  return {
    params: params,
    exist: params.length > 0,
    isNullable: params.every(function (_ref10) {
      var schema = _ref10.schema;
      return schema.nullable;
    })
  };
}

function majorVersionsCheck(expectedV, inputV) {
  if (!inputV) {
    throw new Error("Swagger-Typescript working with openApi v3/ swagger v2, seem your json is not openApi openApi v3/ swagger v2");
  }

  var expectedVMajor = expectedV.split(".")[0];
  var inputVMajor = inputV.split(".")[0];
  function isValidPart(x) {
    return (/^\d+$/.test(x)
    );
  }
  if (!isValidPart(expectedVMajor) || !isValidPart(inputVMajor)) {
    throw new Error("Swagger-Typescript working with openApi v3/ swagger v2 your json openApi version is not valid \"" + inputV + "\"");
  }

  var expectedMajorNumber = Number(expectedVMajor);
  var inputMajorNumber = Number(inputVMajor);

  if (expectedMajorNumber <= inputMajorNumber) {
    return;
  }

  throw new Error("Swagger-Typescript working with openApi v3/ swagger v2 your json openApi version is " + inputV);
}

function isTypeAny(type) {
  if (type === true) {
    return true;
  }

  if ((typeof type === "undefined" ? "undefined" : (0, _typeof3.default)(type)) === "object" && (0, _keys2.default)(type).length <= 0) {
    return true;
  }

  if (!type || type.AnyValue) {
    return true;
  }

  return false;
}

/** Used to replace {name} in string with obj.name */
function template(str) {
  var obj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  (0, _entries2.default)(obj).forEach(function (_ref11) {
    var _ref12 = (0, _slicedToArray3.default)(_ref11, 2),
        key = _ref12[0],
        value = _ref12[1];

    var re = new RegExp("{" + key + "}", "i");
    str = str.replace(re, value);
  });

  var re = new RegExp("{*}", "g");
  if (re.test(str)) {
    throw new Error("methodName: Some A key is missed \"" + str + "\"");
  }
  return str;
}

function isMatchWholeWord(stringToSearch, word) {
  return new RegExp("\\b" + word + "\\b").test(stringToSearch);
}

exports.majorVersionsCheck = majorVersionsCheck;
exports.getPathParams = getPathParams;
exports.getHeaderParams = getHeaderParams;
exports.generateServiceName = generateServiceName;
exports.getTsType = getTsType;
exports.getRefName = getRefName;
exports.isAscending = isAscending;
exports.getDefineParam = getDefineParam;
exports.getParamString = getParamString;
exports.getParametersInfo = getParametersInfo;
exports.isTypeAny = isTypeAny;
exports.template = template;
exports.toPascalCase = toPascalCase;
exports.getSchemaName = getSchemaName;
exports.isMatchWholeWord = isMatchWholeWord;
//# sourceMappingURL=utils.js.map