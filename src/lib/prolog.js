"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.pl = void 0;
var pl_core_fix_js_1 = require("./pl-core-fix.js");
var lists_1 = require("tau-prolog/modules/lists");
var js_1 = require("tau-prolog/modules/js");
var random_1 = require("tau-prolog/modules/random");
var statistics_1 = require("tau-prolog/modules/statistics");
var util_1 = require("@scenario/util");
exports.pl = pl_core_fix_js_1["default"];
lists_1["default"](exports.pl);
js_1["default"](exports.pl);
random_1["default"](exports.pl);
statistics_1["default"](exports.pl);
// fix consult to handle local user generated files
exports.pl.type.Session.prototype.consult = function (path, options) {
    return __awaiter(this, void 0, void 0, function () {
        var program, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    program = path;
                    if (!(path.slice(path.length - 3) === '.pl')) return [3 /*break*/, 2];
                    path = util_1.fixPath(path);
                    return [4 /*yield*/, util_1.getFileContent(path)];
                case 1:
                    program = _a.sent();
                    _a.label = 2;
                case 2:
                    parsed = this.thread.consult(program, options);
                    if (parsed !== true)
                        throw Error(parsed);
                    return [2 /*return*/, parsed];
            }
        });
    });
};
exports.pl.type.Session.prototype.query = function (string) {
    var success = this.thread.query(string);
    if (success !== true)
        throw Error(success);
    return success;
};
exports.pl.type.Session.prototype.answer = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.thread.answer(resolve);
    });
};
exports.pl.type.Session.prototype.answers = function (max, after) {
    var _this = this;
    var results = [];
    var unfinished = false;
    return new Promise(function (resolve, reject) {
        function add(result) {
            if (result === false) {
                if (unfinished) {
                    results.push(null);
                }
                resolve(results);
            }
            else if (result === null) {
                unfinished = true;
            }
            else if (result.id === 'throw') {
                throw Error(result);
            }
            else {
                results.push(result);
            }
        }
        _this.thread.answers(add, max, after);
    });
};
exports.pl.type.Session.prototype.isTrue = function (string, runUntilResult) {
    var _this = this;
    if (runUntilResult === void 0) { runUntilResult = false; }
    return new Promise(function (resolve, reject) {
        var thread = _this.thread;
        function result(value) {
            if (value !== false) {
                if (value === null) {
                    if (runUntilResult)
                        thread.answer(result);
                    else
                        throw Error('No solution found!');
                }
                if (value.id === 'throw')
                    throw Error(value);
                resolve(true);
            }
            resolve(false);
        }
        thread.query(string);
        thread.answer(result);
    });
};
exports.pl.type.Session.prototype.run = function (string) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var success = _this.thread.query("" + string);
        if (success !== true)
            throw Error(success);
        _this.thread.answer(resolve);
    });
};
exports.pl.type.Session.prototype.asserta = function (string) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var success = _this.thread.query("asserta(" + string + ").");
        if (success !== true)
            throw Error(success);
        _this.thread.answer(resolve);
    });
};
exports.pl.type.Session.prototype.assertz = function (string) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var success = _this.thread.query("assertz(" + string + ").");
        if (success !== true)
            throw Error(success);
        _this.thread.answer(resolve);
    });
};
