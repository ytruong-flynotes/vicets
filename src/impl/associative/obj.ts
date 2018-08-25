import {failure, ValidationResult} from "../../problems";
import {Schema} from "../../schema";
import {merge, typeDescription} from "../util";
import {Associative, conformInPlace} from "./associative";
import {BaseSchema} from "../index";

function objectEntries(object: object): [string, Schema][] {
  const result: [string, Schema][] = [];
  for (const k in object) {
    const s = object[k];
    if (!('conform' in s))
      throw new Error(`${k} was a ${typeDescription(s)}. Expected a schema`);
    result.push([k, s]);
  }
  return result;
}

class ObjectStrategies implements Associative<string, any> {
  constructor(public readonly result: {}) {
  }

  set(k: any, v: any): this {
    this.result[k] = v;
    return this
  }

  has(k: any): boolean {
    return k in this.result;
  }

  get(k: any): any {
    return this.result[k];
  }
}

export class ObjectSchema extends BaseSchema<any, object> {
  public readonly fieldSchemaArray: [string, Schema][];

  constructor(private readonly fieldSchemasAsObject: Record<string,Schema>) {
    super();
    this.fieldSchemaArray = objectEntries(fieldSchemasAsObject);
  }

  conform(value: any): ValidationResult<object> {
    if (value === undefined || value === null)
      return failure('no value');

    if (typeof value !== 'object')
      return failure(`expected an object but got ${typeof value}`);

    const instance = {};
    Object.assign(instance, value);
    return this.conformInPlace(instance);
  }

  public conformInPlace(instance: {}) : ValidationResult<{}>{
    const problems = conformInPlace(new ObjectStrategies(instance), this.fieldSchemaArray);
    return problems ? problems : instance;
  }

  intersect(other: this): this {
    const mergedSchemas = merge(this.fieldSchemasAsObject, other.fieldSchemasAsObject, (a: Schema, b: Schema) => a.and(b));
    return new ObjectSchema(mergedSchemas) as this;
  }

}



