"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const types_1 = require("./util/types");
class UniqueSchema extends _1.BaseSchema {
    constructor(keyfn) {
        super();
        this.keyfn = keyfn;
    }
    ;
    conform(value) {
        if (!(value instanceof Array))
            return _1.failure(`${types_1.typeDescription(value)} was not an Array`);
        const countKeys = (m, t, i) => {
            const k = this.keyfn(t);
            if (!m.has(k))
                m.set(k, []);
            // @ts-ignore
            m.get(k).push(i);
            return m;
        };
        const keyCounts = value.reduce(countKeys, new Map());
        const p = [];
        for (const [k, indexes] of keyCounts.entries()) {
            if (indexes.length === 1)
                continue;
            const message = `duplicate at indexes: [${indexes}]`;
            const map = indexes.map((i) => _1.problem(message, [i]));
            p.push(...map);
        }
        return p.length > 0 ? _1.problems(...p) : value;
    }
    toJSON() {
        return {
            type: "array",
            description: "unique values"
        };
    }
}
exports.UniqueSchema = UniqueSchema;
//# sourceMappingURL=unique.js.map