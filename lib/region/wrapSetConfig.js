"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _store = require("../global/store");

var _getActionTypes = _interopRequireDefault(require("../util/getActionTypes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = function _default() {
  var Region = function Region(_config) {
    var _this = this;

    _classCallCheck(this, Region);

    _defineProperty(this, "private_setConfig", function () {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var name = config.name,
          reducerPath = config.reducerPath,
          expiredTime = config.expiredTime,
          enableLog = config.enableLog,
          strictLoading = config.strictLoading,
          silentConnect = config.silentConnect,
          DefaultLoading = config.DefaultLoading,
          DefaultError = config.DefaultError;

      if (name !== undefined) {
        _this.name = name;
        _this.private_actionTypes = (0, _getActionTypes.default)(name);
      }

      if (reducerPath !== undefined) {
        console.warn('reducerPath is deprecated, use name instead');
        _this.name = reducerPath;
        _this.private_actionTypes = (0, _getActionTypes.default)(reducerPath);
      }

      if (expiredTime !== undefined) {
        _this.expiredTime = expiredTime;
      }

      if (enableLog !== undefined) {
        _this.enableLog = enableLog;
      }

      if (strictLoading !== undefined) {
        _this.strictLoading = strictLoading;
      }

      if (silentConnect !== undefined) {
        console.warn('silentConnect is deprecated, set {DefaultLoading: () => null} instead');
        _this.silentConnect = silentConnect;
        _this.DefaultLoading = silentConnect ? function () {
          return null;
        } : undefined;
      }

      if (DefaultLoading !== undefined) {
        _this.DefaultLoading = DefaultLoading;
      }

      if (DefaultError !== undefined) {
        _this.DefaultError = DefaultError;
      }
    });

    _defineProperty(this, "setConfig", function () {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      console.warn('setConfig is deprecated, use private_setConfig instead');
      var private_setConfig = _this.private_setConfig;
      var store = config.store;

      if (store !== undefined) {
        console.warn('setStore in setConfig is deprecated, use getProvider or setStore instead');
        (0, _store.setStore)(store);
      }

      private_setConfig(config);
    });

    this.private_setConfig({
      name: null,
      expiredTime: 0,
      enableLog: true,
      strictLoading: true
    });

    if (_config !== null && _typeof(_config) === 'object') {
      this.private_setConfig(_config);
    } else {
      this.private_setConfig({
        name: _config
      });
    }
  };

  return Region;
};

exports.default = _default;