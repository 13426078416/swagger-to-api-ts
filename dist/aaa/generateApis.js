"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateApis = undefined;

var _utils = require("./utils");

var _strings = require("./strings");

var _jsdoc = require("./utilities/jsdoc");

function generateApis(apis, types, config) {
  var code = _strings.SERVICE_BEGINNING;
  try {
    var apisCode = apis.sort(function (_ref, _ref2) {
      var serviceName = _ref.serviceName;
      var _serviceName = _ref2.serviceName;
      return (0, _utils.isAscending)(serviceName, _serviceName);
    }).reduce(function (prev, _ref3) {
      var contentType = _ref3.contentType,
          summary = _ref3.summary,
          deprecated = _ref3.deprecated,
          serviceName = _ref3.serviceName,
          queryParamsTypeName = _ref3.queryParamsTypeName,
          pathParams = _ref3.pathParams,
          requestBody = _ref3.requestBody,
          headerParams = _ref3.headerParams,
          isQueryParamsNullable = _ref3.isQueryParamsNullable,
          isHeaderParamsNullable = _ref3.isHeaderParamsNullable,
          responses = _ref3.responses,
          method = _ref3.method,
          endPoint = _ref3.endPoint,
          pathParamsRefString = _ref3.pathParamsRefString,
          additionalAxiosConfig = _ref3.additionalAxiosConfig,
          security = _ref3.security;

      return prev + ("\n" + (0, _jsdoc.getJsdoc)({
        description: summary,
        deprecated: deprecated ? _strings.DEPRECATED_WARM_MESSAGE : undefined
      }) + "export function " + serviceName + " (\n          " + (
      /** Request Body */
      requestBody ? (0, _utils.getDefineParam)("requestBody", true, requestBody) + "," : queryParamsTypeName ? (0, _utils.getParamString)("requestBody", !isQueryParamsNullable, queryParamsTypeName) + "," : "requestBody:{},") + "configOverride?:AxiosRequestConfig\n){\n  " + (deprecated ? "\n  if (__DEV__) {\n    console.warn(\n      \"" + serviceName + "\",\n      \"" + _strings.DEPRECATED_WARM_MESSAGE + "\",\n    );\n  }" : "") + "\n  return request." + method + "<ResponseData<" + (responses ? (0, _utils.getTsType)(responses) : "any") + ">>(\n    objectToString(" + serviceName + ".key, requestBody, \"" + method + "\"),\n    " + (method === "post" || method === "POST" ? "requestBody," : "") + "\n    overrideConfig(" + additionalAxiosConfig + ",\n      configOverride,\n    )\n  )\n}\n\n/** Key is end point string without base url */\n" + serviceName + ".key = \"" + endPoint + "\";\n");
    }, "");

    code += types.reduce(function (prev, _ref4) {
      var _name = _ref4.name;

      var name = (0, _utils.getSchemaName)(_name);

      if (!(0, _utils.isMatchWholeWord)(apisCode, name)) {
        return prev;
      }

      return prev + (" " + name + ",");
    }, "import {") + ("}  from \"../interface/" + config.name + "\"\n");

    code += _strings.SERVICE_NEEDED_FUNCTIONS;
    code += apisCode;
    return code;
  } catch (error) {
    console.error(error);
    return "";
  }
}

exports.generateApis = generateApis;
//# sourceMappingURL=generateApis.js.map