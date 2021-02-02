"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const impl_1 = require("./impl");
const SCHEMA_SYMBOL = Symbol('schema');
function schemaOf(ctor) {
    for (let search = ctor; search; search = Object.getPrototypeOf(search)) {
        const pd = Object.getOwnPropertyDescriptor(search, SCHEMA_SYMBOL);
        if (pd !== undefined)
            return pd.value;
    }
    throw new Error(`No schema on ${ctor.name}- not annotated with @data?`);
}
exports.schemaOf = schemaOf;
let SUSPEND_VALIDATION = false;
function suspendValidation(f) {
    try {
        SUSPEND_VALIDATION = true;
        return f();
    }
    finally {
        SUSPEND_VALIDATION = false;
    }
}
exports.suspendValidation = suspendValidation;
// TODO: add generic constraints to IN/OUT on Schema?
function hasSchema(schema) {
    return function (c) {
        const hackClassName = {};
        hackClassName[c.name] = class extends c {
            constructor(...args) {
                super(...args);
                if (SUSPEND_VALIDATION)
                    return;
                for (const [k, v] of Object.entries(this)) {
                    if (impl_1.isSchema(v))
                        this[k] = undefined;
                }
                const conformed = schema.conformInPlace(this);
                if (conformed instanceof impl_1.Problems) {
                    throw new impl_1.ValidationError(this, conformed);
                }
            }
            ;
        };
        const decorated = hackClassName[c.name];
        Object.defineProperty(decorated, SCHEMA_SYMBOL, { value: schema, writable: false });
        return decorated;
    };
}
exports.hasSchema = hasSchema;
//# sourceMappingURL=hasschema.js.map