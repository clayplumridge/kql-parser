import {
    Conditional,
    ConditionalComparison,
    Query,
    QueryOperation,
    QueryOperationProject,
    QueryOperationWhere,
    SymbolicValue,
    TokenType,
    Value
} from "src/parse/tokenize";

type Row = Record<string, string | number>;
type DataSetContents = Row[];

class DataPipe {
    constructor(private contents: DataSetContents) {}

    public exec = (query: QueryOperation[]) => {
        // Make a copy so we don't mutate anything
        query = [...query];

        if (query.length == 0) {
            return this.contents;
        } else {
            // Doing it this way because good lord is `this` awful in JS
            const first = this.step(query.shift()!);
            return query.reduce((prev, step) => prev.step(step), first)
                .contents;
        }
    };

    private step(operation: QueryOperation) {
        switch (operation.type) {
            case TokenType.QueryWhere:
                return this.where(operation);
            case TokenType.QueryProject:
                return this.project(operation);
        }
    }

    private where(operation: QueryOperationWhere) {
        return new DataPipe(
            this.contents.filter(x => conditional(x, operation.condition))
        );
    }

    private project(operation: QueryOperationProject) {
        const columns = new Set(operation.columns.map(x => x.symbolName));

        return new DataPipe(
            this.contents.map(item =>
                Object.fromEntries(
                    Object.entries(item).filter(([key, _]) => columns.has(key))
                )
            )
        );
    }
}

export function exec(query: Query): Row[] {
    const pipe = new DataPipe(resolveDataSet(query.dataSet.name));
    return pipe.exec(query.operations);
}

function resolveDataSet(name: string): DataSetContents {
    return [
        {
            IntField: 0,
            StringField: "test"
        },
        {
            IntField: 1,
            StringField: "test"
        },
        {
            IntField: 2,
            StringField: "test"
        }
    ];
}

function conditional(row: Row, conditional: Conditional) {
    const left = resolveValue(row, conditional.left);
    const right = resolveValue(row, conditional.right);

    switch (conditional.operation) {
        case ConditionalComparison.Equals:
            return left === right;
        case ConditionalComparison.NotEquals:
            return left !== right;
        case ConditionalComparison.GreaterThan:
            return left > right;
        case ConditionalComparison.LessThan:
            return left < right;
        case ConditionalComparison.GreaterThanOrEqual:
            return left >= right;
        case ConditionalComparison.LessThanOrEqual:
            return left <= right;
    }
}

function resolveValue(row: Row, value: Value) {
    switch (value.type) {
        case TokenType.String:
        case TokenType.Number:
            return value.value;
        case TokenType.SymbolicValue:
            return resolveSymbolicValue(row, value);
    }
}

function resolveSymbolicValue(row: Row, value: SymbolicValue) {
    return row[value.symbolName];
}
