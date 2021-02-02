"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validator_1 = __importDefault(require("validator"));
const _1 = require("./");
class UrlSchema extends _1.BaseStringSchema {
    constructor(opts) {
        super();
        this.opts = opts;
    }
    conformString(value) {
        if (validator_1.default.isURL(value, this.opts))
            return value;
        return _1.failure(`not a valid url: ${value}`);
    }
    toJSON() {
        return Object.assign({}, super.toJSON(), { format: "url" });
    }
}
exports.UrlSchema = UrlSchema;
//# sourceMappingURL=url.js.map