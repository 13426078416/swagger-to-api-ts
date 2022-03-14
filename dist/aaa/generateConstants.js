"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateConstants = undefined;

var _utils = require("./utils");

function generateConstants(types) {
  try {
    return types.sort(function (_ref, _ref2) {
      var name = _ref.name;
      var _name = _ref2.name;
      return (0, _utils.isAscending)(name, _name);
    }).reduce(function (prev, _ref3) {
      var name = _ref3.name,
          value = _ref3.value;

      prev += "export const " + name + " = " + value + ";";

      return prev;
    }, "");
  } catch (error) {
    console.error({ error: error });
    return "";
  }
}

exports.generateConstants = generateConstants;
//# sourceMappingURL=generateConstants.js.map