import {expect} from 'chai';
import {eq, failure, map, opt, Schema} from "../..";

describe('map()', () => {
  const s: Schema<any, Map<string, number>> = map<string, number>({a: eq(1)});

  it('passes valid values through', () => {
    expect(s.conform(new Map().set('a', 1)))
      .deep.equals(new Map().set('a', 1));
  });
  it('accepts objects and coverts to map', () => {
    expect(s.conform({a: 1}))
      .deep.equals(new Map().set('a', 1));
  });
  it('supports optional fields', () => {
    const optional: Schema<object, object> = map({a: opt(eq(1))});

    expect(optional.conform(new Map()))
      .deep.equals(new Map());

    const valid = new Map().set('a', 1);
    expect(optional.conform(valid))
      .deep.equals(valid);
  });
  it('appends key to path in problems', () => {
    expect(s.conform(new Map().set('a', 2)))
      .deep.equals(failure(
      "expected '1' but got number: 2",
      ['a']));
  });
  it('can be nested', () => {
    const nested: Schema<object, object> = map({a: map({b: eq(1)})});

    expect(nested.conform(new Map().set('a', new Map().set('b', 2)))).deep.equals(failure(
      "expected '1' but got number: 2",
      ['a', 'b']));

    const validMap = new Map().set('a', new Map().set('b', 1));
    expect(nested.conform(validMap))
      .deep.equals(validMap);
  });
});