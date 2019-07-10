import {BaseSchema, Schema, ValidationResult} from "./";

export class DefaultValueSchema<T> extends BaseSchema<any, T> {
  constructor(private readonly value: () => T,
              private readonly subschema: Schema<any, T>) {
    super()
  }

  conform(value: any): ValidationResult<T> {
    if (value === undefined)
      value = this.value();

    return this.subschema.conform(value);
  }

}