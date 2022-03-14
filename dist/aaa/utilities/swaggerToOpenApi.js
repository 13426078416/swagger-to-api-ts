"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.swaggerToOpenApi = undefined;

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _swagger2openapi = require("swagger2openapi");

var _swagger2openapi2 = _interopRequireDefault(_swagger2openapi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** Support swagger v2 */
function swaggerToOpenApi(input) {
  var options = {};
  options.patch = true; // fix up small errors in the source definition
  options.warnOnly = true; // Do not throw on non-patchable errors
  return new _promise2.default(function (resolve, reject) {
    _swagger2openapi2.default.convertObj(input, options, function (err, result) {
      if (err) {
        reject(err);
        return;
      }
      resolve(result.openapi);
    });
  });
} //@ts-ignore
exports.swaggerToOpenApi = swaggerToOpenApi;
//# sourceMappingURL=swaggerToOpenApi.js.map