"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateHook = undefined;

var _utils = require("./utils");

var _strings = require("./strings");

var _jsdoc = require("./utilities/jsdoc");

var allowedPageParametersNames = ["page", "pageno", "pagenumber"];

function generateHook(apis, types, config) {
  var code = (0, _strings.getHooksImports)({
    hasInfinity: !!config.useInfiniteQuery.length
  });
  try {
    apis = apis.sort(function (_ref, _ref2) {
      var serviceName = _ref.serviceName;
      var _serviceName = _ref2.serviceName;
      return (0, _utils.isAscending)(serviceName, _serviceName);
    });

    var apisCode = apis.reduce(function (prev, _ref3) {
      var summary = _ref3.summary,
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
          queryParameters = _ref3.queryParameters;

      var hookName = "use" + (0, _utils.toPascalCase)(serviceName);

      var hasPaging = config.useInfiniteQuery.find(function (name) {
        return name.toLowerCase() === serviceName.toLowerCase() || name.toLowerCase() === hookName.toLowerCase();
      });

      var isGet = hasPaging || method === "get" || config.useQuery.find(function (name) {
        return name.toLowerCase() === serviceName.toLowerCase() || name.toLowerCase() === hookName.toLowerCase();
      });
      var getParamsString = function getParamsString(override) {
        return " " + (pathParams.length ? pathParams.map(function (_ref4) {
          var name = _ref4.name;
          return name;
        }) + "," : "") + "\n          " + (requestBody ? "requestBody," : "") + "\n          " + (queryParamsTypeName ? hasPaging && override ? "{\n                  ..._param,\n                  ...queryParams,\n                }," : "queryParams," : "") + "\n          " + (headerParams ? "headerParams," : "");
      };

      var TData = "" + (responses ? (0, _utils.getTsType)(responses) : "any");
      var TQueryFnData = "ResponseData<" + TData + ">";
      var TError = "RequestError | Error";

      var getQueryParamName = function getQueryParamName(name) {
        var nullable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : isQueryParamsNullable;
        var isPartial = arguments[2];
        return queryParamsTypeName ? (0, _utils.getParamString)(name, !nullable, queryParamsTypeName, undefined, isPartial) + "," : "";
      };

      var TVariables = "" +
      /** Path parameters */
      pathParams.map(function (_ref5) {
        var name = _ref5.name,
            required = _ref5.required,
            schema = _ref5.schema,
            description = _ref5.description;
        return (0, _utils.getDefineParam)(name, required, schema, description);
      }).join(",") + (pathParams.length > 0 ? "," : "") + (
      /** Request Body */
      requestBody ? (0, _utils.getDefineParam)("requestBody", true, requestBody) + "," : "") +
      /** Query parameters */
      getQueryParamName("queryParams") + (
      /** Header parameters */
      headerParams ? (0, _utils.getParamString)("headerParams", !isHeaderParamsNullable, headerParams) + "," : "");

      var deps = "[" + serviceName + ".key," + (pathParams.length ? pathParams.map(function (_ref6) {
        var name = _ref6.name;
        return name;
      }) + "," : "") + "\n            " + (requestBody ? "requestBody," : "") + "\n            " + (queryParamsTypeName ? "queryParams," : "") + "\n            " + (headerParams ? "headerParams," : "") + "]";

      var result = prev + ("\n      " + (0, _jsdoc.getJsdoc)({
        description: summary,
        deprecated: deprecated ? _strings.DEPRECATED_WARM_MESSAGE : undefined
      }));

      result += "export const " + hookName + " =";
      if (!isGet) {
        result += "<TExtra>";
      }

      var params = ["" + (isGet ? TVariables : ""), "options?:" + (hasPaging ? "UseInfiniteQueryOptions<" + TQueryFnData + ", " + TError + ">" : isGet ? "InternalUseQueryOptions<" + TData + ">" : "" + (TVariables ? "InternalUseMutationOptions<" + TData + ", {" + TVariables + "}, TExtra>" : "InternalUseMutationOptionsVoid<" + TData + ", TExtra>")) + ",", "" + (isGet ? "configOverride?:AxiosRequestConfig" : "")];

      result += " (\n           " + params.join("") + "\n           ) => {";
      if (isGet) {
        result += "\n          const { key, fun } = " + hookName + ".info(" + getParamsString() + " configOverride);\n          ";
        if (hasPaging) {
          result += "const {\n            data: { pages } = {},\n            data,\n            ...rest\n          } = useInfiniteQuery(\n            key,\n            ({ pageParam = 1 }) =>\n              fun({\n                  " + queryParameters.find(function (_ref7) {
            var name = _ref7.name;
            return allowedPageParametersNames.includes(name.toLowerCase());
          }).name + ":pageParam,\n              }),\n            {\n              getNextPageParam: (_lastPage, allPages) => allPages.length + 1,\n              ...(options as any),\n            },\n          );\n        \n          const list = useMemo(() => paginationFlattenData(pages), [pages]);\n          const total = getTotal(pages);\n\n          const hasMore = useHasMore(pages, list, queryParams);\n          \n          return {...rest, data, list, hasMore, total}\n          ";
        } else {
          result += "return useQuery(key,()=>\n                fun(),\n                options\n               )";
        }
      } else {
        result += "return useMutation((_o)=>{\n            const {" + getParamsString() + " configOverride } = _o || {};\n\n            return " + serviceName + "(\n                " + getParamsString() + " configOverride,\n              )\n          },\n          options\n         )";
      }

      result += "  \n          }\n        ";

      if (isGet) {
        result += hookName + ".info = (" + params.filter(function (param) {
          return !param.startsWith("options?:");
        }).join("") + ") => {\n              return {\n                key: " + deps + " as QueryKey,\n                fun: (" + (hasPaging ? getQueryParamName("_param", true, true) : "") + ") =>\n                " + serviceName + "(\n                  " + getParamsString(true) + "\n                  configOverride\n                ),\n              };\n            };";

        result += hookName + ".prefetch = (\n            client: QueryClient,\n            " + params.join("") + ") => {\n                const { key, fun } = " + hookName + ".info(" + getParamsString() + " configOverride);\n\n                return client.getQueryData(key)\n                ? Promise.resolve()\n                : client.prefetchQuery(\n                    key,\n                    ()=>fun(),\n                    options\n                  );\n              }";
      }

      return result;
    }, "");

    code += types.sort(function (_ref8, _ref9) {
      var name = _ref8.name;
      var _name = _ref9.name;
      return (0, _utils.isAscending)(name, _name);
    }).reduce(function (prev, _ref10) {
      var _name = _ref10.name;

      var name = (0, _utils.getSchemaName)(_name);
      if (!(0, _utils.isMatchWholeWord)(apisCode, name)) {
        return prev;
      }
      return prev + (" " + name + ",");
    }, "import {") + '}  from "./types"\n';
    code += (0, _strings.getHooksFunctions)({
      hasInfinity: !!config.useInfiniteQuery.length
    });

    code += apis.reduce(function (prev, _ref11) {
      var serviceName = _ref11.serviceName;

      return prev + (" " + serviceName + ",");
    }, "import {") + '}  from "./services"\n';

    code += "\n    type InternalMutationDefaultParams<TExtra> = {_extraVariables?:TExtra, configOverride?:ResponseData}\n    type InternalUseQueryOptions<TData> = UseQueryOptions<ResponseData<TData>,RequestError | Error>;\n\n    type InternalUseMutationOptions<TData, TRequest, TExtra> = UseMutationOptions<\n    ResponseData<TData>,\n      RequestError | Error,\n      TRequest & InternalMutationDefaultParams<TExtra>\n    >;\n\n    type InternalUseMutationOptionsVoid<\n      TData,\n      TExtra\n    > = UseMutationOptions<\n    ResponseData<TData>,\n      RequestError | Error,\n      InternalMutationDefaultParams<TExtra> | void\n    >;  \n    ";

    code += apisCode;

    return code;
  } catch (error) {
    console.error(error);
    return "";
  }
}

exports.generateHook = generateHook;
//# sourceMappingURL=generateHook.js.map