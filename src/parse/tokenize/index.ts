export * from "./tokenize";

export const enum TokenType {
    String = "rawString",
    Number = "rawNumber",
    SymbolicValue = "symbolicValue",
    Query = "query",
    DataSet = "dataSet",
    QueryWhere = "queryWhere",
    Conditional = "conditional",
    Arithmatic = "arithmatic",
    QueryProject = "project"
}

export interface Token<T extends TokenType> {
    type: T;
}

export type Value = SymbolicValue | RawString | RawNumber;

export interface SymbolicValue extends Token<TokenType.SymbolicValue> {
    symbolName: string;
}

export interface RawString extends Token<TokenType.String> {
    value: string;
}

export interface RawNumber extends Token<TokenType.Number> {
    value: number;
}

export interface Query extends Token<TokenType.Query> {
    dataSet: DataSet;
    operations: QueryOperation[];
}

export interface DataSet extends Token<TokenType.DataSet> {
    name: string;
}

export type QueryOperation = QueryOperationWhere | QueryOperationProject;

export interface QueryOperationWhere extends Token<TokenType.QueryWhere> {
    condition: Conditional;
}

export interface Conditional extends Token<TokenType.Conditional> {
    operation: ConditionalComparison;
    left: Value;
    right: Value;
}

export const enum ConditionalComparison {
    Equals = "eq",
    NotEquals = "neq",
    GreaterThan = "gt",
    LessThan = "lt",
    GreaterThanOrEqual = "geq",
    LessThanOrEqual = "leq"
}

export interface QueryOperationProject extends Token<TokenType.QueryProject> {
    columns: SymbolicValue[];
}
