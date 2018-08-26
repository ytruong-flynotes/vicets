import {failure, Problems, ValidationResult} from "../problems";
import {BaseSchema} from "./index";
import {Schema} from "../schema";
import {SchemaOverrides} from "../schemas";
import {typeDescription} from "./util";

export class OverrideSchema<IN, OUT> extends BaseSchema<IN, OUT> {
  constructor(private readonly subschema: Schema<IN, OUT>,
              private readonly overrides: SchemaOverrides<IN, OUT>) {
    super();
  }

  conform(value: IN): ValidationResult<OUT> {
    const result = this.subschema.conform(value);
    return result instanceof Problems
      ? this.failure(value, result)
      : result;
  }

  private failure(value: IN, original: Problems) : Problems {
    const f = this.overrides.failure;

    if(!f ){
      return original;
    }
    else if(typeof f === 'string'){
      return failure(f)
    }
    else if(f instanceof Function){
      return f(value);
    }
    else {
      throw new Error(`Not implemented for ${typeDescription(f)}`);
    }
  }
}