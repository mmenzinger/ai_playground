"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.ScenarioError = exports.__run = exports.run = exports.performAction = exports.validAction = exports.validateAction = exports.getActions = exports.getWinner = exports.getScore = exports.actionToObject = exports.stateToObject = exports.createState = exports.createAction = exports.getBoard = exports.getPlayer = exports.Player = void 0;
var _util_1 = require("@util");
var types_1 = require("@worker/types");
exports.Player = Object.freeze({
    None: 0,
    Computer: 1,
    Human: 2,
    Both: 3,
    Player1: 1,
    Player2: 2
});
var bState = 1048575; // 2:player 18:board
var bPlayer = 3;
var bBoard = 262143; // 2:row wise, left to right
var sPlayer = 18;
var bAction = 63; // 2:row 2:col 2:player
var bRow = 3;
var bCol = 3;
var sRow = 4;
var sCol = 2;
function getPlayer(state) {
    return state >>> sPlayer & bPlayer;
}
exports.getPlayer = getPlayer;
function getBoard(state) {
    var b = state & bBoard;
    return [
        [(b) & bPlayer, (b >>> 2) & bPlayer, (b >>> 4) & bPlayer],
        [(b >>> 6) & bPlayer, (b >>> 8) & bPlayer, (b >>> 10) & bPlayer],
        [(b >>> 12) & bPlayer, (b >>> 14) & bPlayer, (b >>> 16) & bPlayer],
    ];
}
exports.getBoard = getBoard;
function createAction(player, row, col) {
    return (row & bRow) << sRow | (col & bCol) << sCol | (player & bPlayer);
}
exports.createAction = createAction;
function createState(player, board) {
    var state = (player & bPlayer) << sPlayer;
    if (board) {
        state |=
            (board[0][0] << 16 |
                board[0][1] << 14 |
                board[0][2] << 12 |
                board[1][0] << 10 |
                board[1][1] << 8 |
                board[1][2] << 6 |
                board[2][0] << 4 |
                board[2][1] << 2 |
                board[2][2] << 0)
                & bBoard;
    }
    return state;
}
exports.createState = createState;
function stateToObject(state) {
    return {
        board: getBoard(state),
        player: getPlayer(state)
    };
}
exports.stateToObject = stateToObject;
function actionToObject(action) {
    return {
        player: (action & bPlayer),
        row: (action >>> sRow) & bRow,
        col: (action >>> sCol) & bCol
    };
}
exports.actionToObject = actionToObject;
function getScore(state, player) {
    var winner = getWinner(state);
    if (winner === player)
        return 1 | 0;
    if (winner === exports.Player.Both || winner === exports.Player.None)
        return 0 | 0;
    return -1 | 0;
}
exports.getScore = getScore;
function getWinner(state) {
    var b = state & bBoard;
    // check rows
    if (((b >>> 16) & (b >>> 14) & (b >>> 12) & bPlayer) !== 0)
        return (b >>> 12) & bPlayer;
    if (((b >>> 10) & (b >>> 8) & (b >>> 6) & bPlayer) !== 0)
        return (b >>> 6) & bPlayer;
    if (((b >>> 4) & (b >>> 2) & (b) & bPlayer) !== 0)
        return b & bPlayer;
    // check cols
    if (((b >>> 16) & (b >>> 10) & (b >>> 4) & bPlayer) !== 0)
        return (b >>> 4) & bPlayer;
    if (((b >>> 14) & (b >>> 8) & (b >>> 2) & bPlayer) !== 0)
        return (b >>> 2) & bPlayer;
    if (((b >>> 12) & (b >>> 6) & (b) & bPlayer) !== 0)
        return b & bPlayer;
    // check diagonals
    if (((b >>> 16) & (b >>> 8) & (b) & bPlayer) !== 0)
        return (b) & bPlayer;
    if (((b >>> 12) & (b >>> 8) & (b >>> 4) & bPlayer) !== 0)
        return (b >>> 4) & bPlayer;
    // check draw
    for (var i = 0; i < 18; i += 2) {
        if (((b >>> i) & bPlayer) === 0)
            return exports.Player.None;
    }
    return exports.Player.Both;
}
exports.getWinner = getWinner;
function getActions(state) {
    var actions = [];
    var b = state & bBoard;
    for (var i = 0; i < 9; i++) {
        if (((b >>> (i * 2)) & bPlayer) === 0) {
            actions.push(((i / 3 | 0) << sRow |
                (i % 3) << sCol) |
                (state >>> sPlayer) & bPlayer);
        }
    }
    return actions;
}
exports.getActions = getActions;
function validateAction(state, action) {
    var player = action & bPlayer;
    var board = state & bBoard;
    var row = (action >>> sRow) & bRow;
    var col = (action >>> sCol) & bCol;
    if (!Number.isInteger(action) || (action & (~bAction))) {
        throw new ScenarioError("invalid action: " + action + "\nThe update function needs to return a valid Action!");
    }
    if (row === 3)
        throw new ScenarioError("row index must be between 0 and 2 (was " + row + ")");
    if (col === 3)
        throw new ScenarioError("col index must be between 0 and 2 (was " + col + ")");
    if (((board >>> (row * 6 + col * 2)) & bPlayer) !== exports.Player.None)
        throw new ScenarioError("position (" + row + ", " + col + ") not empty");
    if (player !== ((state >>> sPlayer) & bPlayer))
        throw new ScenarioError("invalid player " + player);
}
exports.validateAction = validateAction;
function validAction(state, action) {
    try {
        validateAction(state, action);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.validAction = validAction;
function performAction(state, action) {
    validateAction(state, action);
    var row = (action >>> sRow) & bRow;
    var col = (action >>> sCol) & bCol;
    var newState = (((state & bBoard) | (action & bPlayer) << (row * 6 + col * 2)) |
        (((action & bPlayer) ^ 3) << sPlayer));
    return newState;
}
exports.performAction = performAction;
function run(state, player1, player2) {
    if (player2 === void 0) { player2 = {
        init: function (state) {
            return types_1.call('onInit', [state]);
        },
        update: function (state, actions) {
            return types_1.call('onUpdate', [state, actions]);
        },
        result: function (oldState, action, state, score) {
            return types_1.call('onResult', [oldState, action, state, score]);
        },
        finish: function (state, score) {
            return types_1.call('onFinish', [state, score]);
        }
    }; }
    return __awaiter(this, void 0, void 0, function () {
        var players, winner, currentPlayer, oldState, actions, action, score1, score2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    players = [player1, player2];
                    if (!(player1.init instanceof Function)) return [3 /*break*/, 2];
                    return [4 /*yield*/, player1.init(state)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!(player2.init instanceof Function)) return [3 /*break*/, 4];
                    return [4 /*yield*/, player2.init(state)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    winner = exports.Player.None;
                    _a.label = 5;
                case 5:
                    if (!(winner === exports.Player.None)) return [3 /*break*/, 9];
                    currentPlayer = players[getPlayer(state) - 1];
                    oldState = state;
                    actions = getActions(oldState);
                    return [4 /*yield*/, currentPlayer.update(oldState, actions)];
                case 6:
                    action = _a.sent();
                    state = performAction(oldState, action);
                    winner = getWinner(state);
                    if (!(currentPlayer.result instanceof Function)) return [3 /*break*/, 8];
                    return [4 /*yield*/, currentPlayer.result(oldState, action, state, getScore(state, getPlayer(state)))];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [3 /*break*/, 5];
                case 9:
                    state = (state & bBoard) | (winner << sPlayer);
                    if (!(player1.finish instanceof Function)) return [3 /*break*/, 11];
                    score1 = getScore(state, exports.Player.Player1);
                    return [4 /*yield*/, player1.finish(state, score1)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    if (!(player2.finish instanceof Function)) return [3 /*break*/, 13];
                    score2 = getScore(state, exports.Player.Player2);
                    return [4 /*yield*/, player2.finish(state, score2)];
                case 12:
                    _a.sent();
                    _a.label = 13;
                case 13: return [2 /*return*/, state];
            }
        });
    });
}
exports.run = run;
function __run(settings) {
    return __awaiter(this, void 0, void 0, function () {
        var state, player1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = createState(settings.startingPlayer);
                    return [4 /*yield*/, _util_1.hideImport('/project/index.js')];
                case 1:
                    player1 = _a.sent();
                    return [4 /*yield*/, run(state, player1)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.__run = __run;
var ScenarioError = /** @class */ (function (_super) {
    __extends(ScenarioError, _super);
    function ScenarioError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ScenarioError;
}(Error));
exports.ScenarioError = ScenarioError;
;
