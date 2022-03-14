#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Generate = exports.defaultPrettierConfig = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require("babel-runtime/core-js/object/entries");

var _entries2 = _interopRequireDefault(_entries);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

exports.prettierContent = prettierContent;

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

var _jsYaml = require("js-yaml");

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _swagger2openapi = require("swagger2openapi");

var _swagger2openapi2 = _interopRequireDefault(_swagger2openapi);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _generator2 = require("./aaa/generator");

var _prettier = require("prettier");

var _prettier2 = _interopRequireDefault(_prettier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultPrettierConfig = exports.defaultPrettierConfig = {
  parser: "typescript",
  trailingComma: "all",
  printWidth: 100,
  arrowParens: "always",
  jsxBracketSameLine: false,
  endOfLine: "lf",
  proseWrap: "always"
};
function prettierContent(params) {
  return _prettier2.default.format(params, defaultPrettierConfig);
}

function replaceComponents(input, newJson, refs) {
  var components = (0, _extends3.default)({}, input.components || {});

  ["schemas", "requestBodies", "parameters"].map(function (key) {
    if (newJson.components[key]) {
      (0, _entries2.default)(newJson.components[key]).forEach(function (_ref) {
        var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
            name = _ref2[0],
            schema = _ref2[1];

        if (refs.includes(name)) {
          if (!components[key]) {
            components[key] = (0, _extends3.default)({}, input.components && input.components[key] || {});
          }
          components[key][name] = schema;
        }
      });
    }
  });

  return components;
}

function findRefs(obj) {
  if ((typeof obj === "undefined" ? "undefined" : (0, _typeof3.default)(obj)) !== "object") {
    return [];
  }

  if (Array.isArray(obj)) {
    return obj.flatMap(function (value) {
      return findRefs(value);
    });
  }

  return (0, _entries2.default)(obj).flatMap(function (_ref3) {
    var _ref4 = (0, _slicedToArray3.default)(_ref3, 2),
        key = _ref4[0],
        value = _ref4[1];

    if (key === "$ref") {
      return [value.replace(/#\/components\/[\w]+\//g, "")];
    }
    return findRefs(value);
  });
}

function findRelatedRef(newJson, refs) {
  try {
    ["schemas", "requestBodies", "parameters"].map(function (key) {
      if (newJson.components[key]) {
        (0, _entries2.default)(newJson.components[key]).forEach(function (_ref5) {
          var _ref6 = (0, _slicedToArray3.default)(_ref5, 2),
              name = _ref6[0],
              schema = _ref6[1];

          if (refs.includes(name)) {
            var schemaRefs = findRefs(schema);

            var newRefs = schemaRefs.filter(function (ref) {
              return !refs.includes(ref);
            });

            if (newRefs.length > 0) {
              refs = findRelatedRef(newJson, [].concat((0, _toConsumableArray3.default)(refs), (0, _toConsumableArray3.default)(newRefs)));
            }
          }
        });
      }
    });
  } catch (error) {
    _chalk2.default.red(error);
  }

  return refs;
}
function partialUpdateJson() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { paths: [] };
  var newJson = arguments[1];
  var tag = arguments[2];

  var refs = [];

  var filteredPaths = Object.fromEntries((0, _entries2.default)(input.paths).map(function (_ref7) {
    var _ref8 = (0, _slicedToArray3.default)(_ref7, 2),
        name = _ref8[0],
        value = _ref8[1];

    return [name, Object.fromEntries((0, _entries2.default)(value).filter(function (_ref9) {
      var _ref10 = (0, _slicedToArray3.default)(_ref9, 2),
          _ = _ref10[0],
          tags = _ref10[1].tags;

      return !tags.find(function (item) {
        return tag.find(function (i) {
          return i === item;
        });
      });
    }))];
  }));

  var paths = (0, _extends3.default)({}, filteredPaths);
  (0, _entries2.default)(newJson.paths).forEach(function (_ref11) {
    var _ref12 = (0, _slicedToArray3.default)(_ref11, 2),
        endPoint = _ref12[0],
        value = _ref12[1];

    (0, _entries2.default)(value).forEach(function (_ref13) {
      var _ref14 = (0, _slicedToArray3.default)(_ref13, 2),
          method = _ref14[0],
          options = _ref14[1];

      if ((typeof options === "undefined" ? "undefined" : (0, _typeof3.default)(options)) !== "object") {
        return;
      }

      //   if (tag.find((t) => options.tags.includes(t))) {
      refs = refs.concat(findRefs(options));

      if (!paths[endPoint]) {
        paths[endPoint] = (0, _extends3.default)({}, newJson.paths[endPoint]);
      }
      paths[endPoint][method] = options;
      //   }
    });
  });

  refs = findRelatedRef(newJson, refs);

  var components = replaceComponents(input, newJson, refs);

  return (0, _extends3.default)({}, input, {
    paths: paths,
    components: components
  });
}

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
}

var Generate = exports.Generate = function () {
  function Generate() {
    var _this = this;

    (0, _classCallCheck3.default)(this, Generate);

    var configs = JSON.parse(_fsExtra2.default.readFileSync("swagger.config.json").toString()).data;
    configs.forEach(function (ele) {
      return _this.init(ele);
    });
  }

  (0, _createClass3.default)(Generate, [{
    key: "init",
    value: function () {
      var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(config) {
        var _ref16, content, input, _generator, code, type;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.path = process.cwd();
                _context.next = 3;
                return _axios2.default.get(config.url);

              case 3:
                _ref16 = _context.sent;
                content = _ref16.data;

                if ((typeof content === "undefined" ? "undefined" : (0, _typeof3.default)(content)) !== "object") {
                  content = _jsYaml2.default.load(content);
                }
                _context.next = 8;
                return swaggerToOpenApi(content);

              case 8:
                input = _context.sent;

                input = partialUpdateJson({ paths: [] }, input, []);
                _generator = (0, _generator2.generator)(input, config), code = _generator.code, type = _generator.type;

                _fsExtra2.default.outputFileSync(config.dir + "/api/" + config.name + ".ts", prettierContent(code));
                console.log(_chalk2.default.yellowBright("services Completed"));

                _fsExtra2.default.outputFileSync(config.dir + "/interface/" + config.name + ".ts", prettierContent(type));
                console.log(_chalk2.default.yellowBright("types Completed"));

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x2) {
        return _ref15.apply(this, arguments);
      }

      return init;
    }()
  }]);
  return Generate;
}();

var a = new Generate();
//# sourceMappingURL=init.js.map