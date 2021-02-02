"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function utcDate(year, month, date, hours, minutes, seconds, ms) {
    const ts = ms ? Date.UTC(year, month, date, hours, minutes, seconds, ms)
        : seconds ? Date.UTC(year, month, date, hours, minutes, seconds)
            : minutes ? Date.UTC(year, month, date, hours, minutes)
                : hours ? Date.UTC(year, month, date, hours)
                    : Date.UTC(year, month, date);
    return new Date(ts);
}
exports.utcDate = utcDate;
//# sourceMappingURL=dates.js.map