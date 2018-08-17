import {Constructor, mapValues, PrimitiveValue} from "../util";
import {BaseSchema} from "../index";
import {failure, Problems} from "../../problems";
import {isdata} from "../../schemas";
import {discriminatorReports} from "./find_discriminators";
import {Schema} from "../../schema";

export class DiscriminatedUnionSchema<T> extends BaseSchema<object, T> {
  private readonly discriminator: keyof T;
  private readonly schemasByDiscriminatorValue: Map<PrimitiveValue, Schema<any, T>>;

  constructor(ctors: Constructor<T>[], discriminator: keyof T) {
    super();

    this.discriminator = discriminator;

    const report = discriminatorReports(ctors);
    const schemasByValue = report.validFields.get(this.discriminator);
    if (schemasByValue === undefined)
      throw new Error(`Discriminator '${discriminator}' is not valid: ${report.problems.get(discriminator) || 'not found in classes'}.`);

    this.schemasByDiscriminatorValue = mapValues((v)=>isdata(v), schemasByValue);
  }

  conform(value: object): Problems | T {
    if (!(this.discriminator in value))
      return failure(
        "no value",
        [this.discriminator]);

    let discriminatorValue = value[this.discriminator as string | symbol];
    let schema = this.schemasByDiscriminatorValue.get(discriminatorValue);
    if (schema === undefined)
      return failure(
        `expected one of [${Array.from(this.schemasByDiscriminatorValue.keys()).join(", ")}]`,
        [this.discriminator]);

    return schema.conform(value);
  }

}
