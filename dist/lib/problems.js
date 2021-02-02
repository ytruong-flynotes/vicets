"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Problem {
    constructor(path, message) {
        this.path = path;
        this.message = message;
    }
    prefixPath(p) {
        return new Problem([...p, ...this.path], this.message);
    }
    toString() {
        return `[${this.path.join(' -> ').trimRight()}] : ${this.message}`;
    }
}
exports.Problem = Problem;
class Problems {
    constructor(problems) {
        this.problems = problems;
    }
    get length() {
        return this.problems.length;
    }
    prefixPath(p) {
        return new Problems(this.problems.map(e => e.prefixPath(p)));
    }
    merge(...ps) {
        return ps.reduce((acc, next) => acc.append(...next.problems), this);
    }
    append(...ps) {
        return new Problems([...this.problems, ...ps]);
    }
    toString() {
        return this.problems.map(e => e.toString()).join('\r\n');
    }
}
exports.Problems = Problems;
function isError(x) {
    return x != null && x instanceof Problems;
}
exports.isError = isError;
function isSuccess(x) {
    return !isError(x);
}
exports.isSuccess = isSuccess;
function problem(message, path = []) {
    return new Problem(path, message);
}
exports.problem = problem;
function problems(...ps) {
    return new Problems(ps);
}
exports.problems = problems;
function failure(message, path = []) {
    return problems(problem(message, path));
}
exports.failure = failure;
//# sourceMappingURL=problems.js.map