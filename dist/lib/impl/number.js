"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
class NumberSchema extends _1.BaseSchema {
    constructor(opts) {
        super();
        this.opts = opts;
    }
    conform(value) {
        if (typeof value !== 'number')
            return _1.failure('expected a number');
        const { minimum, exclusiveMinimum, maximum, exclusiveMaximum, multipleOf } = this.opts;
        const p = [];
        if (minimum && !(value >= minimum))
            p.push(_1.problem(`must be greater than or equal to ${minimum}`));
        if (exclusiveMinimum && !(value > exclusiveMinimum))
            p.push(_1.problem(`must be greater than ${exclusiveMinimum}`));
        if (maximum && !(value <= maximum))
            p.push(_1.problem(`must be less than or equal to ${maximum}`));
        if (exclusiveMaximum && !(value < exclusiveMaximum))
            p.push(_1.problem(`must be less than ${exclusiveMaximum}`));
        if (multipleOf && value % multipleOf !== 0)
            p.push(_1.problem(`must be multiple of ${multipleOf}`));
        return (p.length > 0)
            ? _1.problems(...p)
            : value;
    }
    toJSON() {
        const { minimum, exclusiveMinimum, maximum, exclusiveMaximum, multipleOf } = this.opts;
        return Object.assign({ type: "number" }, (minimum && { minimum }), (exclusiveMinimum && { exclusiveMinimum }), (maximum && { maximum }), (exclusiveMaximum && { exclusiveMaximum }), (multipleOf && { multiple: multipleOf }));
    }
}
exports.NumberSchema = NumberSchema;
//# sourceMappingURL=number.js.map