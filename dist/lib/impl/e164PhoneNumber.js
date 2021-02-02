"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const phone_1 = __importDefault(require("phone"));
const _1 = require("./");
const types_1 = require("./util/types");
class E164PhoneNumberSchema extends _1.BaseSchema {
    constructor(defaultCountryIso3166) {
        super();
        this.defaultCountryIso3166 = defaultCountryIso3166;
    }
    conform(value) {
        if (typeof value !== 'string')
            return _1.failure(`expected a string but got ${types_1.typeDescription(value)}`);
        const result = this.defaultCountryIso3166 ? phone_1.default(value, this.defaultCountryIso3166) : phone_1.default(value);
        if (result.length === 0) {
            return _1.failure(`expected a valid E.164 phone number`);
        }
        else {
            return result[0];
        }
    }
    toJSON() {
        return {
            type: "string",
            description: "Phone number",
        };
    }
}
exports.E164PhoneNumberSchema = E164PhoneNumberSchema;
//# sourceMappingURL=e164PhoneNumber.js.map