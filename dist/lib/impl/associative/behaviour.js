"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../helpers");
const core_1 = require("../core");
const jsonSchema_1 = require("../../jsonSchema");
var UnexpectedItemBehaviour;
(function (UnexpectedItemBehaviour) {
    UnexpectedItemBehaviour["DELETE"] = "delete";
    UnexpectedItemBehaviour["IGNORE"] = "ignore";
    UnexpectedItemBehaviour["PROBLEM"] = "problem";
})(UnexpectedItemBehaviour = exports.UnexpectedItemBehaviour || (exports.UnexpectedItemBehaviour = {}));
var MissingItemBehaviour;
(function (MissingItemBehaviour) {
    MissingItemBehaviour["IGNORE"] = "ignore";
    MissingItemBehaviour["PROBLEM"] = "problem";
})(MissingItemBehaviour = exports.MissingItemBehaviour || (exports.MissingItemBehaviour = {}));
let BEHAVIOUR = {
    unexpected: UnexpectedItemBehaviour.PROBLEM,
    missing: MissingItemBehaviour.PROBLEM,
    leakActualValuesInError: false,
};
function behaviour() {
    return BEHAVIOUR;
}
exports.behaviour = behaviour;
function usingBehaviour(behaviour, fn) {
    const old = BEHAVIOUR;
    BEHAVIOUR = Object.assign({}, old, behaviour);
    try {
        return fn();
    }
    finally {
        BEHAVIOUR = old;
    }
}
exports.usingBehaviour = usingBehaviour;
class BehaviourSchema extends core_1.BaseSchema {
    constructor(behaviour, subSchema) {
        super();
        this.behaviour = behaviour;
        this.subSchema = subSchema;
    }
    conform(value) {
        return usingBehaviour(this.behaviour, () => helpers_1.conform(this.subSchema, value));
    }
    toJSON(toJson) {
        return Object.assign({}, jsonSchema_1.subSchemaJson(this.subSchema, toJson), { additionalProperties: this.behaviour.unexpected !== UnexpectedItemBehaviour.PROBLEM });
    }
}
exports.BehaviourSchema = BehaviourSchema;
//# sourceMappingURL=behaviour.js.map