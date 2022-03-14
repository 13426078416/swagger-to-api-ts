"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FILE_HOOKS_CONFIG = exports.DEPRECATED_WARM_MESSAGE = exports.CONFIG = exports.getHooksImports = exports.getHooksFunctions = exports.SERVICE_BEGINNING = exports.HTTP_REQUEST = exports.SERVICE_NEEDED_FUNCTIONS = exports.AUTOGENERATED_COMMENT = undefined;

var _fs = require("fs");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rootPath = process.cwd();

var HTTP_REQUEST = (0, _fs.readFileSync)(_path2.default.resolve(__dirname, "../../files/request.tsf")).toString();

var CONFIG = (0, _fs.readFileSync)(_path2.default.resolve(__dirname, "../../files/config.tsf")).toString();

var FILE_HOOKS_CONFIG = (0, _fs.readFileSync)(_path2.default.resolve(__dirname, "../../files/hooksConfig.tsf")).toString();

var AUTOGENERATED_COMMENT = "\n/**\n* AUTO_GENERATED Do not change this file directly, use config.ts file instead\n*\n* @version 5\n*/\n";

var SERVICE_BEGINNING = AUTOGENERATED_COMMENT + "\nimport { AxiosRequestConfig } from \"axios\";\nimport { ResponseData } from \"../interface/public\";\nimport { request, objectToString } from \"../request\";\n";
var SERVICE_NEEDED_FUNCTIONS = "\n// eslint-disable-next-line @typescript-eslint/no-unused-vars\n// const __DEV__ = process.env.NODE_ENV !== \"production\";\n\n// eslint-disable-next-line @typescript-eslint/no-unused-vars\nfunction overrideConfig(\n  config?: AxiosRequestConfig,\n  configOverride?: AxiosRequestConfig,\n): AxiosRequestConfig {\n  return {\n    ...config,\n    ...configOverride,\n    headers: {\n      ...config?.headers,\n      ...configOverride?.headers,\n    },\n  };\n}\n\n// eslint-disable-next-line @typescript-eslint/no-unused-vars\nexport function template(path: string, obj: { [x: string]: any } = {}) {\n    Object.keys(obj).forEach((key) => {\n      const re = new RegExp(`{${key}}`, \"i\");\n      path = path.replace(re, obj[key]);\n    });\n\n    return path;\n}\n\n// eslint-disable-next-line @typescript-eslint/no-unused-vars\n// function objToForm(requestBody: object) {\n//   const formData = new FormData();\n\n//   Object.entries(requestBody).forEach(([key, value]) => {\n//     value && formData.append(key, value);\n//   });\n\n//   return formData;\n// }\n";

var getHooksImports = function getHooksImports(_ref) {
  var hasInfinity = _ref.hasInfinity;
  return AUTOGENERATED_COMMENT + "\n" + (hasInfinity ? "import { useMemo } from \"react\";" : "") + "\nimport { AxiosRequestConfig } from \"axios\";\nimport {\n  UseQueryOptions,\n  useQuery,\n  useMutation,\n  UseMutationOptions,\n  " + (hasInfinity ? "  useInfiniteQuery,\n  UseInfiniteQueryOptions," : "") + "\n  QueryClient,\n  QueryKey,\n} from \"react-query\";\nimport { RequestError, ResponseData } from \"./config\";\n" + (hasInfinity ? "import { paginationFlattenData, getPageSize, getTotal } from \"./hooksConfig\";" : "") + "\n";
};
var getHooksFunctions = function getHooksFunctions(_ref2) {
  var hasInfinity = _ref2.hasInfinity;
  return hasInfinity ? "\nconst useHasMore = (\n  pages: Array<ResponseData<any>> | undefined,\n  list: any,\n  queryParams: any,\n) =>\n  useMemo(() => {\n    if (!pages || (pages && pages.length < 1)) {\n      return false;\n    }\n\n    const total = getTotal(pages);\n\n    if (total !== undefined) {\n      if (list && list.length < total) {\n        return true;\n      }\n      return false;\n    }\n    if (\n      paginationFlattenData([pages[pages.length - 1]])?.length === getPageSize(queryParams as any)\n    ) {\n      return true;\n    }\n\n    return false;\n  }, [pages, list, queryParams]);\n\n" : "";
};

var DEPRECATED_WARM_MESSAGE = "This endpoint deprecated and will be remove. Please use an alternative";

exports.AUTOGENERATED_COMMENT = AUTOGENERATED_COMMENT;
exports.SERVICE_NEEDED_FUNCTIONS = SERVICE_NEEDED_FUNCTIONS;
exports.HTTP_REQUEST = HTTP_REQUEST;
exports.SERVICE_BEGINNING = SERVICE_BEGINNING;
exports.getHooksFunctions = getHooksFunctions;
exports.getHooksImports = getHooksImports;
exports.CONFIG = CONFIG;
exports.DEPRECATED_WARM_MESSAGE = DEPRECATED_WARM_MESSAGE;
exports.FILE_HOOKS_CONFIG = FILE_HOOKS_CONFIG;
//# sourceMappingURL=strings.js.map