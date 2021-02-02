"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
class RegExpSchema extends _1.BaseStringSchema {
    constructor(r) {
        super();
        this.r = r;
    }
    conformString(value) {
        return this.r.test(value) ? value : _1.failure(`did not match ${this.r}`);
    }
    toJSON() {
        return Object.assign({}, super.toJSON(), { pattern: this.r.toString().replace(/^\//, '').replace(/\/$/, '') });
    }
}
exports.RegExpSchema = RegExpSchema;
//# sourceMappingURL=regexp.js.map