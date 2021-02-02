import { ValidationResult } from "../../problems";
import { Schema } from "../../schema";
import { BaseSchema } from "../core";
export declare enum UnexpectedItemBehaviour {
    DELETE = "delete",
    IGNORE = "ignore",
    PROBLEM = "problem"
}
export declare enum MissingItemBehaviour {
    IGNORE = "ignore",
    PROBLEM = "problem"
}
export interface Behaviour {
    readonly unexpected: UnexpectedItemBehaviour;
    readonly missing: MissingItemBehaviour;
    readonly leakActualValuesInError: boolean;
}
export declare function behaviour(): Behaviour;
export declare function usingBehaviour<T>(behaviour: Partial<Behaviour>, fn: () => T): T;
export declare class BehaviourSchema<IN, OUT> extends BaseSchema<IN, OUT> {
    private readonly behaviour;
    private readonly subSchema;
    constructor(behaviour: Partial<Behaviour>, subSchema: Schema<IN, OUT>);
    conform(value: IN): ValidationResult<OUT>;
    toJSON(toJson?: (s: Schema) => any): any;
}
