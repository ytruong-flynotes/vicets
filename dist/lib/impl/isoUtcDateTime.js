"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const dates_1 = require("./util/dates");
const regex = /^([1-9][0-9]{3})-([0-1][0-9])-([0-3][0-9])(T([0-2][0-9]):([0-6][0-9])(:([0-6][0-9])(\.([0-9]{3}))?)?((Z)|(\+([0-2][0-9]):([0-6][0-9]))))?$/;
var TimeExpectation;
(function (TimeExpectation) {
    TimeExpectation["NEVER"] = "never";
    TimeExpectation["ALWAYS"] = "always";
    TimeExpectation["MAYBE"] = "maybe";
})(TimeExpectation = exports.TimeExpectation || (exports.TimeExpectation = {}));
class IsoUtcDateSchema extends _1.BaseSchema {
    constructor(time) {
        super();
        this.time = time;
    }
    conform(value) {
        if (typeof value === 'string') {
            const match = regex.exec(value);
            if (!match)
                return _1.failure("expected a valid ISO8601 string");
            try {
                const year = Number.parseInt(match[1]);
                const month = Number.parseInt(match[2]) - 1;
                const date = Number.parseInt(match[3]);
                if (value.length === 10 && this.time === TimeExpectation.ALWAYS)
                    return _1.failure("date should have a time of day component");
                const hours = match[5] ? Number.parseInt(match[5]) : 0;
                const minutes = match[6] ? Number.parseInt(match[6]) : 0;
                const seconds = match[8] ? Number.parseInt(match[8]) : 0;
                const millis = match[10] ? Number.parseInt(match[10]) : 0;
                const offsetHours = match[14] ? Number.parseInt(match[14]) : 0;
                const offsetMinutes = match[15] ? Number.parseInt(match[15]) : 0;
                if (offsetHours !== 0 || offsetMinutes !== 0)
                    return _1.failure("expected a UTC date, with timezone specified as Z or 00:00");
                value = dates_1.utcDate(year, month, date, hours, minutes, seconds, millis);
                if (value.getUTCFullYear() !== year ||
                    value.getUTCMonth() !== month ||
                    value.getUTCDate() !== date ||
                    value.getUTCHours() !== hours ||
                    value.getUTCMinutes() !== minutes ||
                    value.getUTCMilliseconds() !== millis)
                    return _1.failure("expected a valid date");
            }
            catch (_a) {
                return _1.failure("expected a valid date");
            }
        }
        if (!(value instanceof Date))
            return _1.failure("expected a date or string");
        if (this.time === TimeExpectation.NEVER && dates_1.utcDate(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()).getTime() !== value.getTime())
            return _1.failure("date should not have a time of day component");
        return value;
    }
    toJSON() {
        return {
            type: "string", format: this.time === TimeExpectation.ALWAYS
                ? 'date-time'
                : this.time === TimeExpectation.NEVER
                    ? 'date'
                    : 'date-time'
        };
    }
}
exports.IsoUtcDateSchema = IsoUtcDateSchema;
//# sourceMappingURL=isoUtcDateTime.js.map