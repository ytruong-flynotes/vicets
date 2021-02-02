"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const data_1 = require("../../data");
const problems_1 = require("../../problems");
const maps_1 = require("../util/maps");
const find_discriminators_1 = require("./find_discriminators");
class DiscriminatedUnionSchema extends __1.BaseSchema {
    constructor(ctors, discriminator) {
        super();
        this.ctors = ctors;
        this.discriminator = discriminator;
        const report = find_discriminators_1.discriminatorReports(ctors);
        const schemasByValue = report.validFields.get(this.discriminator);
        if (schemasByValue === undefined)
            throw new Error(`Discriminator '${discriminator}' is not valid: ${report.problems.get(discriminator) || 'not found in classes'}.`);
        this.schemasByDiscriminatorValue = maps_1.mapValues((v) => new data_1.DataSchema(v), schemasByValue);
    }
    conform(value) {
        if (typeof value !== 'object')
            return problems_1.failure(`expected an object but got ${typeof value}`);
        if (!(this.discriminator in value))
            return problems_1.failure("no value", [this.discriminator]);
        const schema = this.schemaFor(value);
        if (schema === undefined)
            return problems_1.failure(`expected one of [${Array.from(this.schemasByDiscriminatorValue.keys()).join(", ")}]`, [this.discriminator]);
        return schema.conform(value);
    }
    or(that) {
        if (that instanceof DiscriminatedUnionSchema
            && this.discriminator === that.discriminator) {
            try {
                // This will give much better error messages, if it's possible
                // to combine the schemas.
                return new DiscriminatedUnionSchema([...this.ctors, ...that.ctors], this.discriminator);
            }
            catch (e) {
                //lean on constructor validation logic
            }
        }
        return super.or(that);
    }
    schemaFor(value) {
        const discriminatorValue = value[this.discriminator];
        return this.schemasByDiscriminatorValue.get(discriminatorValue);
    }
    toJSON(toJson) {
        const allOf = [];
        for (const [v, schema] of this.schemasByDiscriminatorValue.entries()) {
            allOf.push({
                if: { properties: { [this.discriminator]: { const: v } } },
                then: __1.subSchemaJson(schema, toJson),
            });
        }
        return {
            type: "object",
            properties: {
                [this.discriminator]: true
            },
            allOf
        };
    }
}
exports.DiscriminatedUnionSchema = DiscriminatedUnionSchema;
//# sourceMappingURL=index.js.map