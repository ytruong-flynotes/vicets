"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
class UuidSchema extends _1.RegExpSchema {
    constructor() {
        super(REGEX);
    }
    conformString(value) {
        const conformed = value.toLowerCase();
        return REGEX.test(conformed) ? conformed : _1.failure(`not a valid uuid: ${value}`);
    }
    toJSON() {
        return Object.assign({}, super.toJSON(), { format: "uuid" });
    }
}
exports.UuidSchema = UuidSchema;
//# sourceMappingURL=uuid.js.map