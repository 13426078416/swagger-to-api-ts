"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getJsdoc = undefined;

var _values = require("babel-runtime/core-js/object/values");

var _values2 = _interopRequireDefault(_values);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function assignToDescription(params) {
  if ((0, _values2.default)(params).every(function (v) {
    return !v;
  })) {
    return undefined;
  }

  var description = params.description,
      title = params.title,
      format = params.format,
      maxLength = params.maxLength,
      minLength = params.minLength,
      max = params.max,
      min = params.min,
      minimum = params.minimum,
      maximum = params.maximum,
      pattern = params.pattern;


  return "" + (title ? "\n * " + title + "\n * " : "") + (description ? "\n * " + description : "") + (format ? "\n * - Format: " + format : "") + (maxLength ? "\n * - maxLength: " + maxLength : "") + (minLength ? "\n * - minLength: " + minLength : "") + (min ? "\n * - min: " + min : "") + (max ? "\n * - max: " + max : "") + (minimum ? "\n * - minimum: " + minimum : "") + (maximum ? "\n * - max: " + maximum : "") + (pattern ? "\n * - pattern: " + pattern : "");
}

function getJsdoc(doc) {
  var descriptionWithDetails = assignToDescription(doc);

  return doc.deprecated || descriptionWithDetails || doc.example ? "\n/**" + (descriptionWithDetails ? "\n * " + normalizeDescription(descriptionWithDetails) : "") + (doc.deprecated ? "\n * @deprecated " + (normalizeDescription(doc.deprecated) || "") : "") + (doc.example ? "\n * @example \n *   " + doc.example : "") + "\n */\n" : "";
}

function normalizeDescription() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

  return str.replace(/\*\//g, "*\\/");
}

exports.getJsdoc = getJsdoc;
//# sourceMappingURL=jsdoc.js.map