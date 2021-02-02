"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const problems_1 = require("../problems");
const _1 = require("./");
const types_1 = require("./util/types");
class BaseSchema {
    or(s) {
        return new OrSchema([this, s]);
    }
    and(s) {
        return new AndSchema([this, s]);
    }
    __() {
        return this;
    }
}
exports.BaseSchema = BaseSchema;
class AndSchema extends BaseSchema {
    constructor(subSchemas) {
        super();
        this.subSchemas = subSchemas;
    }
    conform(value) {
        return this.subSchemas.reduce((result, schema) => {
            if (problems_1.isError(result))
                return result;
            return helpers_1.conform(schema, result);
        }, value);
    }
    and(s) {
        return s instanceof AndSchema
            ? new AndSchema([...this.subSchemas, ...s.subSchemas])
            : new AndSchema([...this.subSchemas, s]);
    }
    toJSON(toJson) {
        return {
            allOf: _1.subSchemaJson(this.subSchemas, toJson)
        };
    }
}
exports.AndSchema = AndSchema;
class OrSchema extends BaseSchema {
    constructor(subSchemas) {
        super();
        this.subSchemas = subSchemas;
    }
    conform(value) {
        const failures = [];
        for (const s of this.subSchemas) {
            const result = s.conform(value);
            if (problems_1.isSuccess(result))
                return result;
            failures.push(result);
        }
        return failures.reduce((a, ps) => a ? a.merge(ps) : ps);
    }
    or(s) {
        return s instanceof OrSchema
            ? new OrSchema([...this.subSchemas, ...s.subSchemas])
            : new OrSchema([...this.subSchemas, s]);
    }
    toJSON(toJson) {
        return {
            anyOf: _1.subSchemaJson(this.subSchemas, toJson)
        };
    }
}
exports.OrSchema = OrSchema;
class BaseStringSchema extends BaseSchema {
    conform(value) {
        if (typeof value === 'string' || value instanceof String)
            return this.conformString(value);
        return problems_1.failure(`expected a string but got ${types_1.typeDescription(value)}`);
    }
    toJSON() {
        return { type: "string" };
    }
}
exports.BaseStringSchema = BaseStringSchema;
class StringSchema extends BaseStringSchema {
    conformString(value) {
        return value;
    }
}
exports.StringSchema = StringSchema;
class DelegatingSchema extends BaseSchema {
    constructor(delegatedConform, toJSON = () => {
        throw new Error('toJSON not implemented');
    }) {
        super();
        this.delegatedConform = delegatedConform;
        this.toJSON = toJSON;
    }
    conform(value) {
        return this.delegatedConform(value);
    }
}
exports.DelegatingSchema = DelegatingSchema;
function isSchema(value) {
    // TODO: probably wrong?
    return value instanceof BaseSchema;
}
exports.isSchema = isSchema;
//# sourceMappingURL=core.js.map