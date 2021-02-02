"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
class BooleanSchema extends _1.BaseSchema {
    conform(value) {
        const t = typeof value;
        if (value instanceof Boolean || t === "boolean")
            return value;
        if (value instanceof String || t === "string") {
            const s = value.toLowerCase();
            if (["true", "false"].indexOf(s) < 0)
                return _1.failure(`expected a boolean`);
            return s === 'true';
        }
        return _1.failure(`expected a boolean`);
    }
    toJSON() {
        return { type: "boolean" };
    }
}
exports.BooleanSchema = BooleanSchema;
//# sourceMappingURL=bool.js.map