export declare function mapKeyValue<K, V, NEWK, NEWV>(f: (k: K, v: V) => [NEWK, NEWV], m: Map<K, V>): Map<NEWK, NEWV>;
export declare function mapValues<K, V, NEWV>(f: (v: V) => NEWV, m: Map<K, V>): Map<K, NEWV>;
export declare function merge<K, V>(a: Map<K, V>, b: Map<K, V>, conflictFn: (a: V, b: V) => V): Map<K, V>;
export declare function toMap<K, V>(x: {}): Map<K, V>;
