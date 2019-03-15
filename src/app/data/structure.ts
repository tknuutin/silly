
import * as R from 'ramda';
import { Lens, compose } from './lensUtils';

type StructureProp<TRoot, P> = {
    l: {
        (): Lens;
        (rootObj: TRoot): P;
        (rootObj: TRoot, val: P): TRoot
    }
};
type StructureObjProp<TRoot, P> = StructureObjNode<TRoot, P> & StructureProp<TRoot, P>;

type StructureObjNode<TRoot, TNode> = {
    [P in keyof TNode]: TNode[P] extends Object
        ? StructureObjProp<TRoot, TNode[P]>
        : StructureProp<TRoot, TNode[P]>;
};
type Structure<T> = StructureObjNode<T, T>;

function makeStructureNode<TRoot, TNode>(node: TNode, lensChain?: Lens): StructureProp<TRoot, TNode> | StructureObjProp<TRoot, TNode> {
    const nodeFunc = { l: ((rootObj?: TRoot, val?: TNode) => {
        if (!lensChain) {
            throw new Error('Invalid arguments to structure, no object passed at root?');
        }
        if (!rootObj) {
            return lensChain;
        }

        if (!val) {
            return R.view(lensChain, rootObj) as TNode;
        }

        return R.set(lensChain, val, rootObj) as TRoot;
    })} as StructureProp<TRoot, TNode>;

    if (typeof node !== 'object') {
        return nodeFunc;
    }
    
    const objValues = R.mapObjIndexed((value: any, key: string) => {
        const currentLens = R.lensProp(key);
        const lens = lensChain ? compose(lensChain, currentLens) : currentLens;
        return makeStructureNode(value, lens);
    }, node);

    R.forEach(([key, value]: [string, any]) => {
        nodeFunc[key] = value;
    }, R.toPairs(objValues));
    return nodeFunc;
}

export function lensify<T extends Object>(node: T): Structure<T> {
    return makeStructureNode<T, T>(node) as StructureObjProp<T, T>;
}

// interface State {
//     prop: number;
//     obj: {
//         foo: string;
//         more: {
//             yeah: number;
//         }
//     }
// }

// const defaultState: State = {
//     prop: 3, obj: { foo: 'hello!', more: { yeah: 4 } }
// }

// const stateL = lensify(defaultState)

// stateL.obj.more.yeah.l(defaultState) // Equivalent to R.view. Typesafe!
// stateL.obj.more.yeah.l(defaultState, 6) // Equivalent to R.set. Typesafe!
// stateL.obj.more.yeah.l() // Returns pure Ramda lens

