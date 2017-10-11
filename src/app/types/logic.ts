
import { VariableRef } from './common';

type Comparison = [VariableRef, VariableRef | number];

export interface LogicAtom {
    // Does this variable reference exist?
    exists?: VariableRef;

    // Is this variable equal to the number?
    eq?: Comparison;

    // Is this variable less than the number?
    lt?: Comparison;

    // Is this variable less than or equal than the number?
    lte?: Comparison;

    // Is this variable greater than the number?
    gt?: Comparison;

    // Is this variable greater or equal than the number?
    gte?: Comparison;

    // A static logical value that will be used.
    value?: boolean;
}

export interface AndCombinator {
    and: [LogicAtom | Combinator, LogicAtom | Combinator];
}

export interface OrCombinator {
    or: [LogicAtom | Combinator, LogicAtom | Combinator];
}

export interface AllCombinator {
    all: Array<LogicAtom | Combinator>;
}

export interface AnyCombinator {
    any: Array<LogicAtom | Combinator>;
}

export interface NoneCombinator {
    none: Array<LogicAtom | Combinator>;
}

export interface NotCombinator {
    not: LogicAtom | Combinator;
}

export type Combinator =
    AndCombinator |
    OrCombinator |
    AllCombinator |
    AnyCombinator |
    NoneCombinator |
    NotCombinator;

