type BuildTupleHelper<Element, Length extends number, Rest extends Element[]> =
  Rest['length'] extends Length ?
    readonly [...Rest] : // Terminate with readonly array (aka tuple)
    BuildTupleHelper<Element, Length, [Element, ...Rest]>;

export type ReadonlyTuple<Element, Length extends number> =
  number extends Length
    // Because `Length extends number` and `number extends Length`, then `Length` is not a specific finite number.
    ? readonly Element[] // It's not fixed length.
    : BuildTupleHelper<Element, Length, []>; // Otherwise it is a fixed length tuple.

export type UnionTupleSpread<Element, Size extends number, Rest extends Element[]> =
  Rest['length'] extends Size ?
    readonly [...Rest] : // Terminate with readonly array (aka tuple)
    ReadonlyTuple<Element, Rest['length']> | UnionTupleSpread<Element, Size, [Element, ...Rest]>;
