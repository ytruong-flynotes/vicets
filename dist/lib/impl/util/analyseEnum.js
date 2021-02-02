"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
var EntryType;
(function (EntryType) {
    EntryType[EntryType["StringMember"] = 0] = "StringMember";
    EntryType[EntryType["ReverseMapping"] = 1] = "ReverseMapping";
    EntryType[EntryType["NumericMember"] = 2] = "NumericMember";
    EntryType[EntryType["Invalid"] = 3] = "Invalid";
})(EntryType || (EntryType = {}));
var EnumType;
(function (EnumType) {
    EnumType[EnumType["InitializedStrings"] = 0] = "InitializedStrings";
    EnumType[EnumType["InitializedIntegers"] = 1] = "InitializedIntegers";
    EnumType[EnumType["Mixed"] = 2] = "Mixed";
})(EnumType = exports.EnumType || (exports.EnumType = {}));
function analyseEnum(e) {
    let allStringMembers = true;
    let someStringMembers = false;
    const values = new Set();
    for (let [k, v] of Object.entries(e)) {
        if (!isNaN(Number(k)))
            k = Number(k);
        const valueType = typeof v;
        const keyType = typeof k;
        const entryType = (keyType === 'string' && valueType === 'string') ? EntryType.StringMember :
            (keyType === 'string' && valueType === 'number') ? EntryType.NumericMember :
                (keyType === 'number' && valueType === 'string') ? EntryType.ReverseMapping :
                    EntryType.Invalid;
        if (entryType === EntryType.Invalid)
            throw new Error(`Entries must be string:number, number:string or string:string. Field '${k}' was ${types_1.typeDescription(k)}:${types_1.typeDescription(v)}.`);
        if (entryType !== EntryType.StringMember)
            allStringMembers = false;
        if (entryType !== EntryType.ReverseMapping)
            values.add(v);
        if (entryType === EntryType.StringMember)
            someStringMembers = true;
        else if (e[v.toString()] != k)
            throw new Error(`Not a proper enum. e["${k}"] = ${JSON.stringify(v)} but e["${v}"] = ${JSON.stringify(e[v])}`);
    }
    const type = allStringMembers ? EnumType.InitializedStrings :
        someStringMembers ? EnumType.Mixed :
            EnumType.InitializedIntegers;
    return { values, type };
}
exports.analyseEnum = analyseEnum;
//# sourceMappingURL=analyseEnum.js.map