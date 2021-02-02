"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const analyseEnum_1 = require("./util/analyseEnum");
class EnumValueSchema extends _1.BaseSchema {
    constructor(e) {
        super();
        this.e = e;
        const { values, type } = analyseEnum_1.analyseEnum(this.e);
        this.enumValues = values;
        this.enumType = type;
        this.failureMessage = `expected one of [${Array.from(this.enumValues).map((v) => JSON.stringify(v)).join(', ')}]`;
    }
    conform(value) {
        if (this.enumValues.has(value))
            return value;
        return _1.failure(this.failureMessage);
    }
    toJSON() {
        switch (this.enumType) {
            case analyseEnum_1.EnumType.InitializedIntegers:
                return {
                    type: "number",
                    enum: [...this.enumValues]
                };
            case analyseEnum_1.EnumType.InitializedStrings:
                return {
                    type: "string",
                    enum: [...this.enumValues]
                };
            case analyseEnum_1.EnumType.Mixed:
                return {
                    type: ["string", "number"],
                    enum: [...this.enumValues]
                };
            default:
                throw new Error(`Enum type ${JSON.stringify(this.enumType)} not supported`);
        }
    }
}
exports.EnumValueSchema = EnumValueSchema;
//# sourceMappingURL=enumvalue.js.map