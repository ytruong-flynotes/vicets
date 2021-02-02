"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const iterables_1 = require("../util/iterables");
const maps_1 = require("../util/maps");
const types_1 = require("../util/types");
class CandidateDiscriminators {
    constructor(ctors) {
        this.constructors = [];
        this.fields = new Map();
        this.constructors = [...ctors];
        for (const ctor of this.constructors) {
            for (const [fieldName, value] of CandidateDiscriminators.fieldsWithPrimitiveEquals(ctor)) {
                const result = this.fields.get(fieldName) || new Map();
                result.set(value, (result.get(value) || []).concat([ctor]));
                this.fields.set(fieldName, result);
            }
        }
    }
    static fieldsWithPrimitiveEquals(ctor) {
        return CandidateDiscriminators.fieldSchemas(ctor)
            .map(([field, schema]) => schema instanceof __1.EqualsSchema && types_1.isPrimitive(schema.expected) ? [field, schema.expected] : undefined)
            .filter((x) => x)
            .map((x) => types_1.unsafeCast(x));
    }
    static fieldSchemas(ctor) {
        return __1.schemaOf(ctor).fieldSchemaArray;
    }
    keys() {
        return this.fields.keys();
    }
    get(field) {
        return this.fields.get(field);
    }
    problemWithDiscriminator(field) {
        const values = this.fields.get(field);
        for (const [value, ctors] of values) {
            if (ctors.length > 1)
                return `value '${value}' is repeated in: ${ctors.map((c) => c.name).join(", ")}`;
        }
        if (values.size !== this.constructors.length)
            return 'field is not present in all classes';
    }
}
class DiscriminatorReport {
    constructor() {
        this.problems = new Map();
        this.validFields = new Map();
    }
    reject(k, problem) {
        this.problems.set(k, problem);
        return this;
    }
    accept(k, mappings) {
        this.validFields.set(k, mappings);
        return this;
    }
}
function detectDiscriminator(ctors) {
    const report = discriminatorReports(ctors);
    if (report.validFields.size > 1)
        throw new Error(`Multiple possible discriminator fields: [${Array.from(report.validFields.keys()).join(', ')}]`);
    if (report.validFields.size === 0 && report.problems.size === 0)
        throw new Error(`No discriminator fields found in: [${ctors.map((c) => c.name).join(', ')}]`);
    const k = iterables_1.first(report.validFields.keys());
    if (k !== undefined) {
        return k;
    }
    const listOfFieldProblems = Array.from(report.problems.entries()).map(([k, problem]) => `${k}: ${problem}`);
    throw new Error(`No discriminator field found. Considered:\r\n${listOfFieldProblems.join('\r\n')}`);
}
exports.detectDiscriminator = detectDiscriminator;
function discriminatorReports(ctors) {
    const candidates = new CandidateDiscriminators(ctors);
    const report = new DiscriminatorReport();
    for (const k of candidates.keys()) {
        const problem = candidates.problemWithDiscriminator(k);
        if (problem !== undefined)
            report.reject(k, problem);
        else
            report.accept(k, maps_1.mapKeyValue((k, v) => [k, v[0]], candidates.get(k)));
    }
    return report;
}
exports.discriminatorReports = discriminatorReports;
//# sourceMappingURL=find_discriminators.js.map