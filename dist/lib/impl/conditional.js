"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../helpers");
const impl_1 = require("../impl");
const jsonSchema_1 = require("../jsonSchema");
class ConditionalSchema extends impl_1.BaseSchema {
    constructor(matches) {
        super();
        this.matches = matches;
    }
    conform(value) {
        let problems = impl_1.failure('could not match any case');
        for (const [case_, schema] of this.matches) {
            const matchResult = helpers_1.conform(case_, value);
            if (impl_1.isSuccess(matchResult))
                return helpers_1.conform(schema, value);
            else
                problems = problems.merge(matchResult);
        }
        return problems;
    }
    case(case_, schema) {
        const caseSchema = impl_1.isSchema(case_)
            ? case_
            : new impl_1.BehaviourSchema({ unexpected: impl_1.UnexpectedItemBehaviour.IGNORE }, new impl_1.ObjectSchema(case_));
        return new ConditionalSchema([...this.matches, [caseSchema, schema]]);
    }
    toJSON(toJson) {
        if (this.matches.length === 0)
            return false;
        function subs(schema) {
            const result = jsonSchema_1.subSchemaJson(schema, toJson);
            delete result['additionalProperties'];
            delete result['required'];
            delete result['type'];
            return result;
        }
        return this.matches
            .reverse()
            .reduce((result, [condition, schema]) => {
            return Object.assign({ if: subs(condition), then: jsonSchema_1.subSchemaJson(schema, toJson) }, (result ? { else: result } : {}));
        }, undefined);
    }
}
exports.ConditionalSchema = ConditionalSchema;
//# sourceMappingURL=conditional.js.map