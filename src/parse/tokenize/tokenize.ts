import { replaceAll, trim } from "../../util";
import {
    Conditional,
    ConditionalComparison,
    DataSet,
    Query,
    QueryOperation,
    QueryOperationProject,
    QueryOperationWhere,
    SymbolicValue,
    Token,
    TokenType,
    Value
} from ".";

export function tokenize(queryString: string) {
    queryString = replaceAll(queryString, "\n", " ");
    const symbols = queryString.split(" ");
    return query(symbols);
}

function doUntilUnknownTokenOrEmpty<T>(
    tokenBuffer: string[],
    testForKnownToken: (testToken: string) => boolean,
    exec: (tokenBuffer: string[]) => T
) {
    const result: T[] = [];

    while (tokenBuffer[0] && testForKnownToken(tokenBuffer[0])) {
        result.push(exec(tokenBuffer));
    }

    return result;
}

function query(tokenBuffer: string[]): Query {
    return {
        type: TokenType.Query,
        dataSet: dataSet(tokenBuffer),
        operations: doUntilUnknownTokenOrEmpty(
            tokenBuffer,
            x => x == "|",
            queryOperation
        )
    };
}

function dataSet(tokenBuffer: string[]): DataSet {
    const nameString = tokenBuffer.shift();
    if (nameString) {
        return {
            type: TokenType.DataSet,
            name: nameString
        };
    }

    throw new Error(`Attepted to parse dataSet but tokenBuffer was empty`);
}

function queryOperation(tokenBuffer: string[]): QueryOperation {
    const pipe = tokenBuffer.shift();
    const next = tokenBuffer.shift();

    if (pipe !== "|") {
        throw new Error(
            `queryOperations should start with a pipe character, '|', got ${pipe} instead`
        );
    }

    switch (next) {
        case "where":
            return queryOperationWhere(tokenBuffer);
        case "project":
            return queryOperationProject(tokenBuffer);
        case undefined:
            throw new Error(
                `Attempted to parse queryOperation but tokenBuffer was empty`
            );
        default:
            throw new Error(
                `Unknown token at start of queryOperation: ${next}`
            );
    }
}

function queryOperationWhere(tokenBuffer: string[]): QueryOperationWhere {
    return { type: TokenType.QueryWhere, condition: conditional(tokenBuffer) };
}

function conditional(tokenBuffer: string[]): Conditional {
    return {
        type: TokenType.Conditional,
        left: value(tokenBuffer),
        operation: conditionalComparison(tokenBuffer),
        right: value(tokenBuffer)
    };
}

function value(tokenBuffer: string[]): Value {
    const token = tokenBuffer.shift();

    if (!token) {
        throw new Error(`Attempted to parse value, but tokenBuffer was empty`);
    }

    const firstChar = token[0];
    if (!isNaN(Number(firstChar))) {
        return { type: TokenType.Number, value: Number(token) };
    } else if (firstChar == '"') {
        return { type: TokenType.String, value: trim(token, '"') };
    } else {
        return { type: TokenType.SymbolicValue, symbolName: token };
    }
}

function symbolicValue(tokenBuffer: string[]): SymbolicValue {
    const token = tokenBuffer.shift();

    if (!token) {
        throw new Error(
            `Attempted to parse symbolic value, but tokenBuffer was empty`
        );
    }

    return { type: TokenType.SymbolicValue, symbolName: token };
}

function conditionalComparison(tokenBuffer: string[]): ConditionalComparison {
    const op = tokenBuffer.shift();

    switch (op) {
        case "==":
        case "===":
            return ConditionalComparison.Equals;
        case "!=":
        case "!==":
            return ConditionalComparison.NotEquals;
        case ">":
            return ConditionalComparison.GreaterThan;
        case "<":
            return ConditionalComparison.LessThan;
        case ">=":
            return ConditionalComparison.GreaterThanOrEqual;
        case "<=":
            return ConditionalComparison.LessThanOrEqual;
        case undefined:
            throw new Error(
                `Attempted to parse conditionalComparison but the buffer was empty`
            );
        default:
            throw new Error(`Unknown comparison operator: ${op}`);
    }
}

function queryOperationProject(tokenBuffer: string[]): QueryOperationProject {
    return {
        type: TokenType.QueryProject,
        columns: list(tokenBuffer, x => symbolicValue([x]))
    };
}

function list<T extends Token<TokenType>>(
    tokenBuffer: string[],
    mapping: (token: string) => T
) {
    const result: T[] = [];

    let current: string | undefined;

    do {
        current = tokenBuffer.shift();

        if (!current) {
            throw new Error(`TODO`);
        }

        const trimmed = trim(current, ",");
        result.push(mapping(trimmed));
    } while (current && current.endsWith(","));

    return result;
}
