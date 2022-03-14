"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generator = undefined;

var _values = require("babel-runtime/core-js/object/values");

var _values2 = _interopRequireDefault(_values);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require("babel-runtime/helpers/extends");

var _extends4 = _interopRequireDefault(_extends3);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require("babel-runtime/core-js/object/entries");

var _entries2 = _interopRequireDefault(_entries);

var _utils = require("./utils");

var _generateApis = require("./generateApis");

var _generateTypes = require("./generateTypes");

var _generateConstants = require("./generateConstants");

var _generateHook = require("./generateHook");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function generator(input, config) {
  var apis = [];
  var types = [];
  var constantsCounter = 0;
  var constants = [];

  function getConstantName(value) {
    var constant = constants.find(function (_constant) {
      return _constant.value === value;
    });
    if (constant) {
      return constant.name;
    }

    var name = "_CONSTANT" + constantsCounter++;

    constants.push({
      name: name,
      value: value
    });

    return name;
  }

  try {
    (0, _entries2.default)(input.paths).forEach(function (_ref) {
      var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
          endPoint = _ref2[0],
          value = _ref2[1];

      var parametersExtended = value.parameters;
      (0, _entries2.default)(value).forEach(function (_ref3) {
        var _ref4 = (0, _slicedToArray3.default)(_ref3, 2),
            method = _ref4[0],
            options = _ref4[1];

        if (method === "parameters") {
          return;
        }

        var operationId = options.operationId,
            security = options.security;


        var allParameters = parametersExtended || options.parameters ? [].concat((0, _toConsumableArray3.default)(parametersExtended || []), (0, _toConsumableArray3.default)(options.parameters || [])) : undefined;

        var parameters = (allParameters || []).map(function (parameter) {
          var $ref = parameter.$ref;

          if ($ref) {
            var name = $ref.replace("#/components/parameters/", "");
            return (0, _extends4.default)({}, input.components.parameters[name], {
              $ref: $ref,
              schema: { $ref: $ref }
            });
          }
          return parameter;
        });

        var serviceName = (0, _utils.generateServiceName)(endPoint, method, operationId, config);

        var pathParams = (0, _utils.getPathParams)(parameters);

        var _getParametersInfo = (0, _utils.getParametersInfo)(parameters, "query"),
            queryParams = _getParametersInfo.exist,
            isQueryParamsNullable = _getParametersInfo.isNullable,
            queryParameters = _getParametersInfo.params;

        var queryParamsTypeName = (0, _utils.toPascalCase)(serviceName) + "QueryParams";

        queryParamsTypeName = queryParams && queryParamsTypeName;

        if (queryParamsTypeName) {
          types.push({
            tags: options.tags,
            name: queryParamsTypeName,
            schema: {
              type: "object",
              nullable: isQueryParamsNullable,
              properties: queryParameters.reduce(function (prev, _ref5) {
                var name = _ref5.name,
                    schema = _ref5.schema,
                    $ref = _ref5.$ref,
                    required = _ref5.required,
                    description = _ref5.description;

                return (0, _extends4.default)({}, prev, (0, _defineProperty3.default)({}, name, (0, _extends4.default)({}, $ref ? { $ref: $ref } : schema, {
                  nullable: !required,
                  description: description
                })));
              }, {})
            }
          });
        }

        var _getHeaderParams = (0, _utils.getHeaderParams)(parameters, config),
            headerParams = _getHeaderParams.params,
            hasNullableHeaderParams = _getHeaderParams.hasNullable;

        var requestBody = getBodyContent(options.requestBody);

        var contentType = (0, _keys2.default)(options.requestBody && options.requestBody.content || options.requestBody && options.requestBody.$ref && input.components && input.components.requestBodies[(0, _utils.getRefName)(options.requestBody.$ref)].content || {
          "application/json": null
        })[0];

        var accept = (0, _keys2.default)(options.responses[200].content || {
          "application/json": null
        })[0];

        var responses = getBodyContent(options.responses[200]);

        var pathParamsRefString = pathParams.reduce(function (prev, _ref6) {
          var name = _ref6.name;
          return "" + prev + name + ",";
        }, "");
        pathParamsRefString = pathParamsRefString ? "{" + pathParamsRefString + "}" : undefined;

        var additionalAxiosConfig = headerParams ? "{\n              headers:{\n                ..." + getConstantName("{\n                  \"Content-Type\": \"" + contentType + "\",\n                  Accept: \"" + accept + "\",\n\n                }") + ",\n                ...headerParams,\n              },\n            }" : getConstantName("{\n              headers: {\n                \"Content-Type\": \"" + contentType + "\",\n                Accept: \"" + accept + "\",\n              },\n            }");

        apis.push({
          tags: options.tags,
          contentType: contentType,
          summary: options.summary,
          deprecated: options.deprecated,
          serviceName: serviceName,
          queryParamsTypeName: queryParamsTypeName,
          pathParams: pathParams,
          requestBody: requestBody,
          headerParams: headerParams,
          isQueryParamsNullable: isQueryParamsNullable,
          isHeaderParamsNullable: hasNullableHeaderParams,
          responses: responses,
          pathParamsRefString: pathParamsRefString,
          endPoint: endPoint,
          method: method,
          security: security ? getConstantName((0, _stringify2.default)(security)) : "undefined",
          additionalAxiosConfig: additionalAxiosConfig,
          queryParameters: queryParameters
        });
      });
    });

    if (input.components.schemas) {
      types.push.apply(types, (0, _toConsumableArray3.default)((0, _entries2.default)(input.components.schemas).map(function (_ref7) {
        var _ref8 = (0, _slicedToArray3.default)(_ref7, 2),
            name = _ref8[0],
            schema = _ref8[1];

        return {
          name: name,
          schema: schema
        };
      })));
    }

    if (input.components.parameters) {
      types.push.apply(types, (0, _toConsumableArray3.default)((0, _entries2.default)(input.components.parameters).map(function (_ref9) {
        var _ref10 = (0, _slicedToArray3.default)(_ref9, 2),
            key = _ref10[0],
            value = _ref10[1];

        return (0, _extends4.default)({}, value, {
          name: key
        });
      })));
    }

    if (input.components.requestBodies) {
      types.push.apply(types, (0, _toConsumableArray3.default)((0, _entries2.default)(input.components.requestBodies).map(function (_ref11) {
        var _ref12 = (0, _slicedToArray3.default)(_ref11, 2),
            name = _ref12[0],
            _requestBody = _ref12[1];

        return {
          name: "RequestBody" + name,
          schema: (0, _values2.default)(_requestBody.content || {})[0].schema,
          description: _requestBody.description
        };
      }).filter(function (v) {
        return v.schema;
      })));
    }

    var code = (0, _generateApis.generateApis)(apis, types, config);
    code += (0, _generateConstants.generateConstants)(constants);
    var type = (0, _generateTypes.generateTypes)(types, config);
    var hooks = config.reactHooks ? (0, _generateHook.generateHook)(apis, types, config) : "";

    return { code: code, hooks: hooks, type: type };
  } catch (error) {
    console.error({ error: error });
    return { code: "", hooks: "", type: "" };
  }
}

function getBodyContent(responses) {
  if (!responses) {
    return responses;
  }

  return responses.content ? (0, _values2.default)(responses.content)[0].schema : responses.$ref ? {
    $ref: responses.$ref
  } : undefined;
}

exports.generator = generator;
//# sourceMappingURL=generator.js.map