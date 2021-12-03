"use strict";
var os = {
};
function tryParseNumber(text, stopAtNext) {
    var number, string = '', leadingZeros = 0, testLeading = true;
    var at = 0;
    var ch;
    function next() {
        ch = text.charAt(at);
        at++;
        return ch;
    }
    next();
    if (ch === '-') {
        string = '-';
        next();
    }
    while(ch >= '0' && ch <= '9'){
        if (testLeading) {
            if (ch == '0') leadingZeros++;
            else testLeading = false;
        }
        string += ch;
        next();
    }
    if (testLeading) leadingZeros--;
    if (ch === '.') {
        string += '.';
        while(next() && ch >= '0' && ch <= '9')string += ch;
    }
    if (ch === 'e' || ch === 'E') {
        string += ch;
        next();
        if (ch === '-' || ch === '+') {
            string += ch;
            next();
        }
        while(ch >= '0' && ch <= '9'){
            string += ch;
            next();
        }
    }
    while(ch && ch <= ' ')next();
    if (stopAtNext) {
        if (ch === ',' || ch === '}' || ch === ']' || ch === '#' || ch === '/' && (text[at] === '/' || text[at] === '*')) ch = 0;
    }
    number = +string;
    if (ch || leadingZeros || !isFinite(number)) return undefined;
    else return number;
}
function createComment(value, comment) {
    if (Object.defineProperty) Object.defineProperty(value, "__COMMENTS__", {
        enumerable: false,
        writable: true
    });
    return value.__COMMENTS__ = comment || {
    };
}
function removeComment(value) {
    Object.defineProperty(value, "__COMMENTS__", {
        value: undefined
    });
}
function getComment(value) {
    return value.__COMMENTS__;
}
function forceComment(text) {
    if (!text) return "";
    var a = text.split('\n');
    var str, i, j, len;
    for(j = 0; j < a.length; j++){
        str = a[j];
        len = str.length;
        for(i = 0; i < len; i++){
            var c = str[i];
            if (c === '#') break;
            else if (c === '/' && (str[i + 1] === '/' || str[i + 1] === '*')) {
                if (str[i + 1] === '*') j = a.length;
                break;
            } else if (c > ' ') {
                a[j] = '# ' + str;
                break;
            }
        }
    }
    return a.join('\n');
}
const __default = {
    EOL: os.EOL || '\n',
    tryParseNumber: tryParseNumber,
    createComment: createComment,
    removeComment: removeComment,
    getComment: getComment,
    forceComment: forceComment
};
const __default1 = "3.2.1";
"use strict";
function loadDsf(col, type) {
    if (Object.prototype.toString.apply(col) !== '[object Array]') {
        if (col) throw new Error("dsf option must contain an array!");
        else return nopDsf;
    } else if (col.length === 0) return nopDsf;
    var dsf = [];
    function isFunction(f) {
        return ({
        }).toString.call(f) === '[object Function]';
    }
    col.forEach(function(x) {
        if (!x.name || !isFunction(x.parse) || !isFunction(x.stringify)) throw new Error("extension does not match the DSF interface");
        dsf.push(function() {
            try {
                if (type == "parse") {
                    return x.parse.apply(null, arguments);
                } else if (type == "stringify") {
                    var res = x.stringify.apply(null, arguments);
                    if (res !== undefined && (typeof res !== "string" || res.length === 0 || res[0] === '"' || [].some.call(res, function(c) {
                        return isInvalidDsfChar(c);
                    }))) throw new Error("value may not be empty, start with a quote or contain a punctuator character except colon: " + res);
                    return res;
                } else throw new Error("Invalid type");
            } catch (e) {
                throw new Error("DSF-" + x.name + " failed; " + e.message);
            }
        });
    });
    return runDsf.bind(null, dsf);
}
function runDsf(dsf, value) {
    if (dsf) {
        for(var i = 0; i < dsf.length; i++){
            var res = dsf[i](value);
            if (res !== undefined) return res;
        }
    }
}
function nopDsf() {
}
function isInvalidDsfChar(c) {
    return c === '{' || c === '}' || c === '[' || c === ']' || c === ',';
}
function math() {
    return {
        name: "math",
        parse: function(value) {
            switch(value){
                case "+inf":
                case "inf":
                case "+Inf":
                case "Inf":
                    return Infinity;
                case "-inf":
                case "-Inf":
                    return -Infinity;
                case "nan":
                case "NaN":
                    return NaN;
            }
        },
        stringify: function(value) {
            if (typeof value !== 'number') return;
            if (1 / value === -Infinity) return "-0";
            if (value === Infinity) return "Inf";
            if (value === -Infinity) return "-Inf";
            if (isNaN(value)) return "NaN";
        }
    };
}
math.description = "support for Inf/inf, -Inf/-inf, Nan/naN and -0";
function hex(opt) {
    var out = opt && opt.out;
    return {
        name: "hex",
        parse: function(value) {
            if (/^0x[0-9A-Fa-f]+$/.test(value)) return parseInt(value, 16);
        },
        stringify: function(value) {
            if (out && Number.isInteger(value)) return "0x" + value.toString(16);
        }
    };
}
hex.description = "parse hexadecimal numbers prefixed with 0x";
function date() {
    return {
        name: "date",
        parse: function(value) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(value) || /^\d{4}-\d{2}-\d{2}T\d{2}\:\d{2}\:\d{2}(?:.\d+)(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
                var dt = Date.parse(value);
                if (!isNaN(dt)) return new Date(dt);
            }
        },
        stringify: function(value) {
            if (Object.prototype.toString.call(value) === '[object Date]') {
                var dt = value.toISOString();
                if (dt.indexOf("T00:00:00.000Z", dt.length - 14) !== -1) return dt.substr(0, 10);
                else return dt;
            }
        }
    };
}
date.description = "support ISO dates";
const __default2 = {
    loadDsf: loadDsf,
    std: {
        math: math,
        hex: hex,
        date: date
    }
};
"use strict";
function __default3(source, opt) {
    var text;
    var at;
    var ch;
    var escapee = {
        '"': '"',
        "'": "'",
        '\\': '\\',
        '/': '/',
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t'
    };
    var keepComments;
    var runDsf1;
    function resetAt() {
        at = 0;
        ch = ' ';
    }
    function isPunctuatorChar(c) {
        return c === '{' || c === '}' || c === '[' || c === ']' || c === ',' || c === ':';
    }
    function error(m) {
        var i, col = 0, line = 1;
        for(i = at - 1; i > 0 && text[i] !== '\n'; i--, col++){
        }
        for(; i > 0; i--)if (text[i] === '\n') line++;
        throw new Error(m + " at line " + line + "," + col + " >>>" + text.substr(at - col, 20) + " ...");
    }
    function next() {
        ch = text.charAt(at);
        at++;
        return ch;
    }
    function peek(offs) {
        return text.charAt(at + offs);
    }
    function string(allowML) {
        var string = '';
        var exitCh = ch;
        while(next()){
            if (ch === exitCh) {
                next();
                if (allowML && exitCh === "'" && ch === "'" && string.length === 0) {
                    next();
                    return mlString();
                } else return string;
            }
            if (ch === '\\') {
                next();
                if (ch === 'u') {
                    var uffff = 0;
                    for(var i = 0; i < 4; i++){
                        next();
                        var c = ch.charCodeAt(0), hex;
                        if (ch >= '0' && ch <= '9') hex = c - 48;
                        else if (ch >= 'a' && ch <= 'f') hex = c - 97 + 10;
                        else if (ch >= 'A' && ch <= 'F') hex = c - 65 + 10;
                        else error("Bad \\u char " + ch);
                        uffff = uffff * 16 + hex;
                    }
                    string += String.fromCharCode(uffff);
                } else if (typeof escapee[ch] === 'string') {
                    string += escapee[ch];
                } else break;
            } else if (ch === '\n' || ch === '\r') {
                error("Bad string containing newline");
            } else {
                string += ch;
            }
        }
        error("Bad string");
    }
    function mlString() {
        var string = '', triple = 0;
        var indent = 0;
        for(;;){
            var c = peek(-indent - 5);
            if (!c || c === '\n') break;
            indent++;
        }
        function skipIndent() {
            var skip = indent;
            while(ch && ch <= ' ' && ch !== '\n' && skip-- > 0)next();
        }
        while(ch && ch <= ' ' && ch !== '\n')next();
        if (ch === '\n') {
            next();
            skipIndent();
        }
        for(;;){
            if (!ch) {
                error("Bad multiline string");
            } else if (ch === '\'') {
                triple++;
                next();
                if (triple === 3) {
                    if (string.slice(-1) === '\n') string = string.slice(0, -1);
                    return string;
                } else continue;
            } else {
                while(triple > 0){
                    string += '\'';
                    triple--;
                }
            }
            if (ch === '\n') {
                string += '\n';
                next();
                skipIndent();
            } else {
                if (ch !== '\r') string += ch;
                next();
            }
        }
    }
    function keyname() {
        if (ch === '"' || ch === "'") return string(false);
        var name = "", start = at, space = -1;
        for(;;){
            if (ch === ':') {
                if (!name) error("Found ':' but no key name (for an empty key name use quotes)");
                else if (space >= 0 && space !== name.length) {
                    at = start + space;
                    error("Found whitespace in your key name (use quotes to include)");
                }
                return name;
            } else if (ch <= ' ') {
                if (!ch) error("Found EOF while looking for a key name (check your syntax)");
                else if (space < 0) space = name.length;
            } else if (isPunctuatorChar(ch)) {
                error("Found '" + ch + "' where a key name was expected (check your syntax or use quotes if the key name includes {}[],: or whitespace)");
            } else {
                name += ch;
            }
            next();
        }
    }
    function white() {
        while(ch){
            while(ch && ch <= ' ')next();
            if (ch === '#' || ch === '/' && peek(0) === '/') {
                while(ch && ch !== '\n')next();
            } else if (ch === '/' && peek(0) === '*') {
                next();
                next();
                while(ch && !(ch === '*' && peek(0) === '/'))next();
                if (ch) {
                    next();
                    next();
                }
            } else break;
        }
    }
    function tfnns() {
        var value = ch;
        if (isPunctuatorChar(ch)) error("Found a punctuator character '" + ch + "' when expecting a quoteless string (check your syntax)");
        for(;;){
            next();
            var isEol = ch === '\r' || ch === '\n' || ch === '';
            if (isEol || ch === ',' || ch === '}' || ch === ']' || ch === '#' || ch === '/' && (peek(0) === '/' || peek(0) === '*')) {
                var chf = value[0];
                switch(chf){
                    case 'f':
                        if (value.trim() === "false") return false;
                        break;
                    case 'n':
                        if (value.trim() === "null") return null;
                        break;
                    case 't':
                        if (value.trim() === "true") return true;
                        break;
                    default:
                        if (chf === '-' || chf >= '0' && chf <= '9') {
                            var n = __default.tryParseNumber(value);
                            if (n !== undefined) return n;
                        }
                }
                if (isEol) {
                    value = value.trim();
                    var dsfValue = runDsf1(value);
                    return dsfValue !== undefined ? dsfValue : value;
                }
            }
            value += ch;
        }
    }
    function getComment(cAt, first) {
        var i;
        cAt--;
        for(i = at - 2; i > cAt && text[i] <= ' ' && text[i] !== '\n'; i--);
        if (text[i] === '\n') i--;
        if (text[i] === '\r') i--;
        var res = text.substr(cAt, i - cAt + 1);
        for(i = 0; i < res.length; i++){
            if (res[i] > ' ') {
                var j = res.indexOf('\n');
                if (j >= 0) {
                    var c = [
                        res.substr(0, j),
                        res.substr(j + 1)
                    ];
                    if (first && c[0].trim().length === 0) c.shift();
                    return c;
                } else return [
                    res
                ];
            }
        }
        return [];
    }
    function errorClosingHint(value) {
        function search(value, ch) {
            var i, k, length, res;
            switch(typeof value){
                case 'string':
                    if (value.indexOf(ch) >= 0) res = value;
                    break;
                case 'object':
                    if (Object.prototype.toString.apply(value) === '[object Array]') {
                        for(i = 0, length = value.length; i < length; i++){
                            res = search(value[i], ch) || res;
                        }
                    } else {
                        for(k in value){
                            if (!Object.prototype.hasOwnProperty.call(value, k)) continue;
                            res = search(value[k], ch) || res;
                        }
                    }
            }
            return res;
        }
        function report(ch) {
            var possibleErr = search(value, ch);
            if (possibleErr) {
                return "found '" + ch + "' in a string value, your mistake could be with:\n" + "  > " + possibleErr + "\n" + "  (unquoted strings contain everything up to the next line!)";
            } else return "";
        }
        return report('}') || report(']');
    }
    function array() {
        var array1 = [];
        var comments, cAt, nextComment;
        try {
            if (keepComments) comments = __default.createComment(array1, {
                a: []
            });
            next();
            cAt = at;
            white();
            if (comments) nextComment = getComment(cAt, true).join('\n');
            if (ch === ']') {
                next();
                if (comments) comments.e = [
                    nextComment
                ];
                return array1;
            }
            while(ch){
                array1.push(value());
                cAt = at;
                white();
                if (ch === ',') {
                    next();
                    cAt = at;
                    white();
                }
                if (comments) {
                    var c = getComment(cAt);
                    comments.a.push([
                        nextComment || "",
                        c[0] || ""
                    ]);
                    nextComment = c[1];
                }
                if (ch === ']') {
                    next();
                    if (comments) comments.a[comments.a.length - 1][1] += nextComment || "";
                    return array1;
                }
                white();
            }
            error("End of input while parsing an array (missing ']')");
        } catch (e) {
            e.hint = e.hint || errorClosingHint(array1);
            throw e;
        }
    }
    function object(withoutBraces) {
        var key = "", object1 = {
        };
        var comments, cAt, nextComment;
        try {
            if (keepComments) comments = __default.createComment(object1, {
                c: {
                },
                o: []
            });
            if (!withoutBraces) {
                next();
                cAt = at;
            } else cAt = 1;
            white();
            if (comments) nextComment = getComment(cAt, true).join('\n');
            if (ch === '}' && !withoutBraces) {
                if (comments) comments.e = [
                    nextComment
                ];
                next();
                return object1;
            }
            while(ch){
                key = keyname();
                white();
                if (ch !== ':') error("Expected ':' instead of '" + ch + "'");
                next();
                object1[key] = value();
                cAt = at;
                white();
                if (ch === ',') {
                    next();
                    cAt = at;
                    white();
                }
                if (comments) {
                    var c = getComment(cAt);
                    comments.c[key] = [
                        nextComment || "",
                        c[0] || ""
                    ];
                    nextComment = c[1];
                    comments.o.push(key);
                }
                if (ch === '}' && !withoutBraces) {
                    next();
                    if (comments) comments.c[key][1] += nextComment || "";
                    return object1;
                }
                white();
            }
            if (withoutBraces) return object1;
            else error("End of input while parsing an object (missing '}')");
        } catch (e) {
            e.hint = e.hint || errorClosingHint(object1);
            throw e;
        }
    }
    function value() {
        white();
        switch(ch){
            case '{':
                return object();
            case '[':
                return array();
            case "'":
            case '"':
                return string(true);
            default:
                return tfnns();
        }
    }
    function checkTrailing(v, c) {
        var cAt = at;
        white();
        if (ch) error("Syntax error, found trailing characters");
        if (keepComments) {
            var b = c.join('\n'), a = getComment(cAt).join('\n');
            if (a || b) {
                var comments = __default.createComment(v, __default.getComment(v));
                comments.r = [
                    b,
                    a
                ];
            }
        }
        return v;
    }
    function rootValue() {
        white();
        var c = keepComments ? getComment(1) : null;
        switch(ch){
            case '{':
                return checkTrailing(object(), c);
            case '[':
                return checkTrailing(array(), c);
            default:
                return checkTrailing(value(), c);
        }
    }
    function legacyRootValue() {
        white();
        var c = keepComments ? getComment(1) : null;
        switch(ch){
            case '{':
                return checkTrailing(object(), c);
            case '[':
                return checkTrailing(array(), c);
        }
        try {
            return checkTrailing(object(true), c);
        } catch (e) {
            resetAt();
            try {
                return checkTrailing(value(), c);
            } catch (e2) {
                throw e;
            }
        }
    }
    if (typeof source !== "string") throw new Error("source is not a string");
    var dsfDef = null;
    var legacyRoot = true;
    if (opt && typeof opt === 'object') {
        keepComments = opt.keepWsc;
        dsfDef = opt.dsf;
        legacyRoot = opt.legacyRoot !== false;
    }
    runDsf1 = __default2.loadDsf(dsfDef, "parse");
    text = source;
    resetAt();
    return legacyRoot ? legacyRootValue() : rootValue();
}
"use strict";
function __default4(data, opt) {
    var plainToken = {
        obj: [
            '{',
            '}'
        ],
        arr: [
            '[',
            ']'
        ],
        key: [
            '',
            ''
        ],
        qkey: [
            '"',
            '"'
        ],
        col: [
            ':',
            ''
        ],
        com: [
            ',',
            ''
        ],
        str: [
            '',
            ''
        ],
        qstr: [
            '"',
            '"'
        ],
        mstr: [
            "'''",
            "'''"
        ],
        num: [
            '',
            ''
        ],
        lit: [
            '',
            ''
        ],
        dsf: [
            '',
            ''
        ],
        esc: [
            '\\',
            ''
        ],
        uni: [
            '\\u',
            ''
        ],
        rem: [
            '',
            ''
        ]
    };
    var eol = __default.EOL;
    var indent = '  ';
    var keepComments = false;
    var bracesSameLine = false;
    var quoteKeys = false;
    var quoteStrings = false;
    var condense = 0;
    var multiline = 1;
    var separator = '';
    var dsfDef = null;
    var sortProps = false;
    var token = plainToken;
    if (opt && typeof opt === 'object') {
        opt.quotes = opt.quotes === 'always' ? 'strings' : opt.quotes;
        if (opt.eol === '\n' || opt.eol === '\r\n') eol = opt.eol;
        keepComments = opt.keepWsc;
        condense = opt.condense || 0;
        bracesSameLine = opt.bracesSameLine;
        quoteKeys = opt.quotes === 'all' || opt.quotes === 'keys';
        quoteStrings = opt.quotes === 'all' || opt.quotes === 'strings' || opt.separator === true;
        if (quoteStrings || opt.multiline == 'off') multiline = 0;
        else multiline = opt.multiline == 'no-tabs' ? 2 : 1;
        separator = opt.separator === true ? token.com[0] : '';
        dsfDef = opt.dsf;
        sortProps = opt.sortProps;
        if (typeof opt.space === 'number') {
            indent = new Array(opt.space + 1).join(' ');
        } else if (typeof opt.space === 'string') {
            indent = opt.space;
        }
        if (opt.colors === true) {
            token = {
                obj: [
                    '\x1b[37m{\x1b[0m',
                    '\x1b[37m}\x1b[0m'
                ],
                arr: [
                    '\x1b[37m[\x1b[0m',
                    '\x1b[37m]\x1b[0m'
                ],
                key: [
                    '\x1b[33m',
                    '\x1b[0m'
                ],
                qkey: [
                    '\x1b[33m"',
                    '"\x1b[0m'
                ],
                col: [
                    '\x1b[37m:\x1b[0m',
                    ''
                ],
                com: [
                    '\x1b[37m,\x1b[0m',
                    ''
                ],
                str: [
                    '\x1b[37;1m',
                    '\x1b[0m'
                ],
                qstr: [
                    '\x1b[37;1m"',
                    '"\x1b[0m'
                ],
                mstr: [
                    "\x1b[37;1m'''",
                    "'''\x1b[0m"
                ],
                num: [
                    '\x1b[36;1m',
                    '\x1b[0m'
                ],
                lit: [
                    '\x1b[36m',
                    '\x1b[0m'
                ],
                dsf: [
                    '\x1b[37m',
                    '\x1b[0m'
                ],
                esc: [
                    '\x1b[31m\\',
                    '\x1b[0m'
                ],
                uni: [
                    '\x1b[31m\\u',
                    '\x1b[0m'
                ],
                rem: [
                    '\x1b[35m',
                    '\x1b[0m'
                ]
            };
        }
        var i, ckeys = Object.keys(plainToken);
        for(i = ckeys.length - 1; i >= 0; i--){
            var k = ckeys[i];
            token[k].push(plainToken[k][0].length, plainToken[k][1].length);
        }
    }
    var runDsf1;
    var commonRange = '\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff';
    var needsEscape = new RegExp('[\\\\\\"\x00-\x1f' + commonRange + ']', 'g');
    var needsQuotes = new RegExp('^\\s|^"|^\'|^#|^\\/\\*|^\\/\\/|^\\{|^\\}|^\\[|^\\]|^:|^,|\\s$|[\x00-\x1f' + commonRange + ']', 'g');
    var needsEscapeML = new RegExp('\'\'\'|^[\\s]+$|[\x00-' + (multiline === 2 ? '\x09' : '\x08') + '\x0b\x0c\x0e-\x1f' + commonRange + ']', 'g');
    var startsWithKeyword = new RegExp('^(true|false|null)\\s*((,|\\]|\\}|#|//|/\\*).*)?$');
    var meta = {
        '\b': 'b',
        '\t': 't',
        '\n': 'n',
        '\f': 'f',
        '\r': 'r',
        '"': '"',
        '\\': '\\'
    };
    var needsEscapeName = /[,\{\[\}\]\s:#"']|\/\/|\/\*/;
    var gap = '';
    var wrapLen = 0;
    function wrap(tk, v) {
        wrapLen += tk[0].length + tk[1].length - tk[2] - tk[3];
        return tk[0] + v + tk[1];
    }
    function quoteReplace(string) {
        return string.replace(needsEscape, function(a) {
            var c = meta[a];
            if (typeof c === 'string') return wrap(token.esc, c);
            else return wrap(token.uni, ('0000' + a.charCodeAt(0).toString(16)).slice(-4));
        });
    }
    function quote(string, gap, hasComment, isRootObject) {
        if (!string) return wrap(token.qstr, '');
        needsQuotes.lastIndex = 0;
        startsWithKeyword.lastIndex = 0;
        if (quoteStrings || hasComment || needsQuotes.test(string) || __default.tryParseNumber(string, true) !== undefined || startsWithKeyword.test(string)) {
            needsEscape.lastIndex = 0;
            needsEscapeML.lastIndex = 0;
            if (!needsEscape.test(string)) return wrap(token.qstr, string);
            else if (!needsEscapeML.test(string) && !isRootObject && multiline) return mlString(string, gap);
            else return wrap(token.qstr, quoteReplace(string));
        } else {
            return wrap(token.str, string);
        }
    }
    function mlString(string, gap) {
        var i, a = string.replace(/\r/g, "").split('\n');
        gap += indent;
        if (a.length === 1) {
            return wrap(token.mstr, a[0]);
        } else {
            var res = eol + gap + token.mstr[0];
            for(i = 0; i < a.length; i++){
                res += eol;
                if (a[i]) res += gap + a[i];
            }
            return res + eol + gap + token.mstr[1];
        }
    }
    function quoteKey(name) {
        if (!name) return '""';
        if (quoteKeys || needsEscapeName.test(name)) {
            needsEscape.lastIndex = 0;
            return wrap(token.qkey, needsEscape.test(name) ? quoteReplace(name) : name);
        } else {
            return wrap(token.key, name);
        }
    }
    function str(value, hasComment, noIndent, isRootObject) {
        function startsWithNL(str) {
            return str && str[str[0] === '\r' ? 1 : 0] === '\n';
        }
        function commentOnThisLine(str) {
            return str && !startsWithNL(str);
        }
        function makeComment(str, prefix, trim) {
            if (!str) return "";
            str = __default.forceComment(str);
            var i, len = str.length;
            for(i = 0; i < len && str[i] <= ' '; i++){
            }
            if (trim && i > 0) str = str.substr(i);
            if (i < len) return prefix + wrap(token.rem, str);
            else return str;
        }
        var dsfValue = runDsf1(value);
        if (dsfValue !== undefined) return wrap(token.dsf, dsfValue);
        switch(typeof value){
            case 'string':
                return quote(value, gap, hasComment, isRootObject);
            case 'number':
                return isFinite(value) ? wrap(token.num, String(value)) : wrap(token.lit, 'null');
            case 'boolean':
                return wrap(token.lit, String(value));
            case 'object':
                if (!value) return wrap(token.lit, 'null');
                var comments;
                if (keepComments) comments = __default.getComment(value);
                var isArray = Object.prototype.toString.apply(value) === '[object Array]';
                var mind = gap;
                gap += indent;
                var eolMind = eol + mind;
                var eolGap = eol + gap;
                var prefix = noIndent || bracesSameLine ? '' : eolMind;
                var partial = [];
                var setsep;
                var cpartial = condense ? [] : null;
                var saveQuoteStrings = quoteStrings, saveMultiline = multiline;
                var iseparator = separator ? '' : token.com[0];
                var cwrapLen = 0;
                var i, length;
                var k, v, vs;
                var c, ca;
                var res, cres;
                if (isArray) {
                    for(i = 0, length = value.length; i < length; i++){
                        setsep = i < length - 1;
                        if (comments) {
                            c = comments.a[i] || [];
                            ca = commentOnThisLine(c[1]);
                            partial.push(makeComment(c[0], "\n") + eolGap);
                            if (cpartial && (c[0] || c[1] || ca)) cpartial = null;
                        } else partial.push(eolGap);
                        wrapLen = 0;
                        v = value[i];
                        partial.push(str(v, comments ? ca : false, true) + (setsep ? separator : ''));
                        if (cpartial) {
                            switch(typeof v){
                                case 'string':
                                    wrapLen = 0;
                                    quoteStrings = true;
                                    multiline = 0;
                                    cpartial.push(str(v, false, true) + (setsep ? token.com[0] : ''));
                                    quoteStrings = saveQuoteStrings;
                                    multiline = saveMultiline;
                                    break;
                                case 'object':
                                    if (v) {
                                        cpartial = null;
                                        break;
                                    }
                                default:
                                    cpartial.push(partial[partial.length - 1] + (setsep ? iseparator : ''));
                                    break;
                            }
                            if (setsep) wrapLen += token.com[0].length - token.com[2];
                            cwrapLen += wrapLen;
                        }
                        if (comments && c[1]) partial.push(makeComment(c[1], ca ? " " : "\n", ca));
                    }
                    if (length === 0) {
                        if (comments && comments.e) partial.push(makeComment(comments.e[0], "\n") + eolMind);
                    } else partial.push(eolMind);
                    if (partial.length === 0) res = wrap(token.arr, '');
                    else {
                        res = prefix + wrap(token.arr, partial.join(''));
                        if (cpartial) {
                            cres = cpartial.join(' ');
                            if (cres.length - cwrapLen <= condense) res = wrap(token.arr, cres);
                        }
                    }
                } else {
                    var commentKeys = comments ? comments.o.slice() : [];
                    var objectKeys = [];
                    for(k in value){
                        if (Object.prototype.hasOwnProperty.call(value, k) && commentKeys.indexOf(k) < 0) objectKeys.push(k);
                    }
                    if (sortProps) {
                        objectKeys.sort();
                    }
                    var keys = commentKeys.concat(objectKeys);
                    for(i = 0, length = keys.length; i < length; i++){
                        setsep = i < length - 1;
                        k = keys[i];
                        if (comments) {
                            c = comments.c[k] || [];
                            ca = commentOnThisLine(c[1]);
                            partial.push(makeComment(c[0], "\n") + eolGap);
                            if (cpartial && (c[0] || c[1] || ca)) cpartial = null;
                        } else partial.push(eolGap);
                        wrapLen = 0;
                        v = value[k];
                        vs = str(v, comments && ca);
                        partial.push(quoteKey(k) + token.col[0] + (startsWithNL(vs) ? '' : ' ') + vs + (setsep ? separator : ''));
                        if (comments && c[1]) partial.push(makeComment(c[1], ca ? " " : "\n", ca));
                        if (cpartial) {
                            switch(typeof v){
                                case 'string':
                                    wrapLen = 0;
                                    quoteStrings = true;
                                    multiline = 0;
                                    vs = str(v, false);
                                    quoteStrings = saveQuoteStrings;
                                    multiline = saveMultiline;
                                    cpartial.push(quoteKey(k) + token.col[0] + ' ' + vs + (setsep ? token.com[0] : ''));
                                    break;
                                case 'object':
                                    if (v) {
                                        cpartial = null;
                                        break;
                                    }
                                default:
                                    cpartial.push(partial[partial.length - 1] + (setsep ? iseparator : ''));
                                    break;
                            }
                            wrapLen += token.col[0].length - token.col[2];
                            if (setsep) wrapLen += token.com[0].length - token.com[2];
                            cwrapLen += wrapLen;
                        }
                    }
                    if (length === 0) {
                        if (comments && comments.e) partial.push(makeComment(comments.e[0], "\n") + eolMind);
                    } else partial.push(eolMind);
                    if (partial.length === 0) {
                        res = wrap(token.obj, '');
                    } else {
                        res = prefix + wrap(token.obj, partial.join(''));
                        if (cpartial) {
                            cres = cpartial.join(' ');
                            if (cres.length - cwrapLen <= condense) res = wrap(token.obj, cres);
                        }
                    }
                }
                gap = mind;
                return res;
        }
    }
    runDsf1 = __default2.loadDsf(dsfDef, 'stringify');
    var res = "";
    var comments = keepComments ? comments = (__default.getComment(data) || {
    }).r : null;
    if (comments && comments[0]) res = comments[0] + '\n';
    res += str(data, null, true, true);
    if (comments) res += comments[1] || "";
    return res;
}
"use strict";
function makeComment(b, a, x) {
    var c;
    if (b) c = {
        b: b
    };
    if (a) (c = c || {
    }).a = a;
    if (x) (c = c || {
    }).x = x;
    return c;
}
function extractComments(value, root) {
    if (value === null || typeof value !== 'object') return;
    var comments = __default.getComment(value);
    if (comments) __default.removeComment(value);
    var i, length;
    var any, res;
    if (Object.prototype.toString.apply(value) === '[object Array]') {
        res = {
            a: {
            }
        };
        for(i = 0, length = value.length; i < length; i++){
            if (saveComment(res.a, i, comments.a[i], extractComments(value[i]))) any = true;
        }
        if (!any && comments.e) {
            res.e = makeComment(comments.e[0], comments.e[1]);
            any = true;
        }
    } else {
        res = {
            s: {
            }
        };
        var keys, currentKeys = Object.keys(value);
        if (comments && comments.o) {
            keys = [];
            comments.o.concat(currentKeys).forEach(function(key) {
                if (Object.prototype.hasOwnProperty.call(value, key) && keys.indexOf(key) < 0) keys.push(key);
            });
        } else keys = currentKeys;
        res.o = keys;
        for(i = 0, length = keys.length; i < length; i++){
            var key = keys[i];
            if (saveComment(res.s, key, comments.c[key], extractComments(value[key]))) any = true;
        }
        if (!any && comments.e) {
            res.e = makeComment(comments.e[0], comments.e[1]);
            any = true;
        }
    }
    if (root && comments && comments.r) {
        res.r = makeComment(comments.r[0], comments.r[1]);
    }
    return any ? res : undefined;
}
function mergeStr() {
    var res = "";
    [].forEach.call(arguments, function(c) {
        if (c && c.trim() !== "") {
            if (res) res += "; ";
            res += c.trim();
        }
    });
    return res;
}
function mergeComments(comments, value) {
    var dropped = [];
    merge(comments, value, dropped, []);
    if (dropped.length > 0) {
        var text = rootComment(value, null, 1);
        text += "\n# Orphaned comments:\n";
        dropped.forEach(function(c) {
            text += ("# " + c.path.join('/') + ": " + mergeStr(c.b, c.a, c.e)).replace("\n", "\\n ") + "\n";
        });
        rootComment(value, text, 1);
    }
}
function saveComment(res, key, item, col) {
    var c = makeComment(item ? item[0] : undefined, item ? item[1] : undefined, col);
    if (c) res[key] = c;
    return c;
}
function droppedComment(path, c) {
    var res = makeComment(c.b, c.a);
    res.path = path;
    return res;
}
function dropAll(comments, dropped, path) {
    if (!comments) return;
    var i, length;
    if (comments.a) {
        for(i = 0, length = comments.a.length; i < length; i++){
            var kpath = path.slice().concat([
                i
            ]);
            var c = comments.a[i];
            if (c) {
                dropped.push(droppedComment(kpath, c));
                dropAll(c.x, dropped, kpath);
            }
        }
    } else if (comments.o) {
        comments.o.forEach(function(key) {
            var kpath = path.slice().concat([
                key
            ]);
            var c = comments.s[key];
            if (c) {
                dropped.push(droppedComment(kpath, c));
                dropAll(c.x, dropped, kpath);
            }
        });
    }
    if (comments.e) dropped.push(droppedComment(path, comments.e));
}
function merge(comments, value, dropped, path) {
    if (!comments) return;
    if (value === null || typeof value !== 'object') {
        dropAll(comments, dropped, path);
        return;
    }
    var i;
    var setComments = __default.createComment(value);
    if (path.length === 0 && comments.r) setComments.r = [
        comments.r.b,
        comments.r.a
    ];
    if (Object.prototype.toString.apply(value) === '[object Array]') {
        setComments.a = [];
        var a = comments.a || {
        };
        for(var key in a){
            if (a.hasOwnProperty(key)) {
                i = parseInt(key);
                var c = comments.a[key];
                if (c) {
                    var kpath = path.slice().concat([
                        i
                    ]);
                    if (i < value.length) {
                        setComments.a[i] = [
                            c.b,
                            c.a
                        ];
                        merge(c.x, value[i], dropped, kpath);
                    } else {
                        dropped.push(droppedComment(kpath, c));
                        dropAll(c.x, dropped, kpath);
                    }
                }
            }
        }
        if (i === 0 && comments.e) setComments.e = [
            comments.e.b,
            comments.e.a
        ];
    } else {
        setComments.c = {
        };
        setComments.o = [];
        (comments.o || []).forEach(function(key) {
            var kpath = path.slice().concat([
                key
            ]);
            var c = comments.s[key];
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                setComments.o.push(key);
                if (c) {
                    setComments.c[key] = [
                        c.b,
                        c.a
                    ];
                    merge(c.x, value[key], dropped, kpath);
                }
            } else if (c) {
                dropped.push(droppedComment(kpath, c));
                dropAll(c.x, dropped, kpath);
            }
        });
        if (comments.e) setComments.e = [
            comments.e.b,
            comments.e.a
        ];
    }
}
function rootComment(value, setText, header) {
    var comment = __default.createComment(value, __default.getComment(value));
    if (!comment.r) comment.r = [
        "",
        ""
    ];
    if (setText || setText === "") comment.r[header] = __default.forceComment(setText);
    return comment.r[header] || "";
}
const __default5 = {
    extract: function(value) {
        return extractComments(value, true);
    },
    merge: mergeComments,
    header: function(value, setText) {
        return rootComment(value, setText, 0);
    },
    footer: function(value, setText) {
        return rootComment(value, setText, 1);
    }
};
"use strict";
const __default6 = {
    parse: __default3,
    stringify: __default4,
    endOfLine: function() {
        return __default.EOL;
    },
    setEndOfLine: function(eol) {
        if (eol === '\n' || eol === '\r\n') __default.EOL = eol;
    },
    version: __default1,
    rt: {
        parse: function(text, options) {
            (options = options || {
            }).keepWsc = true;
            return __default3(text, options);
        },
        stringify: function(value, options) {
            (options = options || {
            }).keepWsc = true;
            return __default4(value, options);
        }
    },
    comments: __default5,
    dsf: __default2.std
};
const parse = __default6.parse;
__default6.stringify;
__default6.endOfLine;
__default6.setEndOfLine;
var util;
(function(util) {
    function assertNever(_x) {
        throw new Error();
    }
    util.assertNever = assertNever;
    util.arrayToEnum = (items)=>{
        const obj = {
        };
        for (const item of items){
            obj[item] = item;
        }
        return obj;
    };
    util.getValidEnumValues = (obj)=>{
        const validKeys = objectKeys(obj).filter((k)=>typeof obj[obj[k]] !== "number"
        );
        const filtered = {
        };
        for (const k of validKeys){
            filtered[k] = obj[k];
        }
        return objectValues(filtered);
    };
    util.objectValues = (obj)=>{
        return objectKeys(obj).map(function(e) {
            return obj[e];
        });
    };
    util.objectKeys = typeof Object.keys === "function" ? (obj)=>Object.keys(obj)
     : (object)=>{
        const keys = [];
        for(const key in object){
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                keys.push(key);
            }
        }
        return keys;
    };
    util.find = (arr, checker)=>{
        for (const item of arr){
            if (checker(item)) return item;
        }
        return undefined;
    };
    util.isInteger = typeof Number.isInteger === "function" ? (val)=>Number.isInteger(val)
     : (val)=>typeof val === "number" && isFinite(val) && Math.floor(val) === val
    ;
})(util || (util = {
}));
const ZodIssueCode = util.arrayToEnum([
    "invalid_type",
    "custom",
    "invalid_union",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of", 
]);
const quotelessJson = (obj)=>{
    const json = JSON.stringify(obj, null, 2);
    return json.replace(/"([^"]+)":/g, "$1:");
};
class ZodError extends Error {
    issues = [];
    get errors() {
        return this.issues;
    }
    constructor(issues){
        super();
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
    }
    format = ()=>{
        const fieldErrors = {
            _errors: []
        };
        const processError = (error)=>{
            for (const issue of error.issues){
                if (issue.code === "invalid_union") {
                    issue.unionErrors.map(processError);
                } else if (issue.code === "invalid_return_type") {
                    processError(issue.returnTypeError);
                } else if (issue.code === "invalid_arguments") {
                    processError(issue.argumentsError);
                } else if (issue.path.length === 0) {
                    fieldErrors._errors.push(issue.message);
                } else {
                    let curr = fieldErrors;
                    let i = 0;
                    while(i < issue.path.length){
                        const el = issue.path[i];
                        const terminal = i === issue.path.length - 1;
                        if (!terminal) {
                            if (typeof el === "string") {
                                curr[el] = curr[el] || {
                                    _errors: []
                                };
                            } else if (typeof el === "number") {
                                const errorArray = [];
                                errorArray._errors = [];
                                curr[el] = curr[el] || errorArray;
                            }
                        } else {
                            curr[el] = curr[el] || {
                                _errors: []
                            };
                            curr[el]._errors.push(issue.message);
                        }
                        curr = curr[el];
                        i++;
                    }
                }
            }
        };
        processError(this);
        return fieldErrors;
    };
    static create = (issues)=>{
        const error = new ZodError(issues);
        return error;
    };
    toString() {
        return this.message;
    }
    get message() {
        return JSON.stringify(this.issues, null, 2);
    }
    get isEmpty() {
        return this.issues.length === 0;
    }
    addIssue = (sub)=>{
        this.issues = [
            ...this.issues,
            sub
        ];
    };
    addIssues = (subs = [])=>{
        this.issues = [
            ...this.issues,
            ...subs
        ];
    };
    flatten = (mapper = (issue)=>issue.message
    )=>{
        const fieldErrors = {
        };
        const formErrors = [];
        for (const sub of this.issues){
            if (sub.path.length > 0) {
                fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
                fieldErrors[sub.path[0]].push(mapper(sub));
            } else {
                formErrors.push(mapper(sub));
            }
        }
        return {
            formErrors,
            fieldErrors
        };
    };
    get formErrors() {
        return this.flatten();
    }
}
const defaultErrorMap = (issue, _ctx)=>{
    let message;
    switch(issue.code){
        case ZodIssueCode.invalid_type:
            if (issue.received === "undefined") {
                message = "Required";
            } else {
                message = `Expected ${issue.expected}, received ${issue.received}`;
            }
            break;
        case ZodIssueCode.unrecognized_keys:
            message = `Unrecognized key(s) in object: ${issue.keys.map((k)=>`'${k}'`
            ).join(", ")}`;
            break;
        case ZodIssueCode.invalid_union:
            message = `Invalid input`;
            break;
        case ZodIssueCode.invalid_enum_value:
            message = `Invalid enum value. Expected ${issue.options.map((val)=>typeof val === "string" ? `'${val}'` : val
            ).join(" | ")}, received ${typeof _ctx.data === "string" ? `'${_ctx.data}'` : _ctx.data}`;
            break;
        case ZodIssueCode.invalid_arguments:
            message = `Invalid function arguments`;
            break;
        case ZodIssueCode.invalid_return_type:
            message = `Invalid function return type`;
            break;
        case ZodIssueCode.invalid_date:
            message = `Invalid date`;
            break;
        case ZodIssueCode.invalid_string:
            if (issue.validation !== "regex") message = `Invalid ${issue.validation}`;
            else message = "Invalid";
            break;
        case ZodIssueCode.too_small:
            if (issue.type === "array") message = `Should have ${issue.inclusive ? `at least` : `more than`} ${issue.minimum} items`;
            else if (issue.type === "string") message = `Should be ${issue.inclusive ? `at least` : `over`} ${issue.minimum} characters`;
            else if (issue.type === "number") message = `Value should be greater than ${issue.inclusive ? `or equal to ` : ``}${issue.minimum}`;
            else message = "Invalid input";
            break;
        case ZodIssueCode.too_big:
            if (issue.type === "array") message = `Should have ${issue.inclusive ? `at most` : `less than`} ${issue.maximum} items`;
            else if (issue.type === "string") message = `Should be ${issue.inclusive ? `at most` : `under`} ${issue.maximum} characters long`;
            else if (issue.type === "number") message = `Value should be less than ${issue.inclusive ? `or equal to ` : ``}${issue.maximum}`;
            else message = "Invalid input";
            break;
        case ZodIssueCode.custom:
            message = `Invalid input`;
            break;
        case ZodIssueCode.invalid_intersection_types:
            message = `Intersection results could not be merged`;
            break;
        case ZodIssueCode.not_multiple_of:
            message = `Should be multiple of ${issue.multipleOf}`;
            break;
        default:
            message = _ctx.defaultError;
            util.assertNever(issue);
    }
    return {
        message
    };
};
let overrideErrorMap = defaultErrorMap;
const setErrorMap = (map)=>{
    overrideErrorMap = map;
};
const ZodParsedType = util.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set", 
]);
const getParsedType = (data)=>{
    const t = typeof data;
    switch(t){
        case "undefined":
            return ZodParsedType.undefined;
        case "string":
            return ZodParsedType.string;
        case "number":
            return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
            return ZodParsedType.boolean;
        case "function":
            return ZodParsedType.function;
        case "bigint":
            return ZodParsedType.bigint;
        case "object":
            if (Array.isArray(data)) return ZodParsedType.array;
            if (data === null) return ZodParsedType.null;
            if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
                return ZodParsedType.promise;
            }
            if (data instanceof Map) {
                return ZodParsedType.map;
            }
            if (data instanceof Set) {
                return ZodParsedType.set;
            }
            if (data instanceof Date) {
                return ZodParsedType.date;
            }
            return ZodParsedType.object;
        default:
            return ZodParsedType.unknown;
    }
};
const makeIssue = (params)=>{
    const { data , path , errorMaps , issueData  } = params;
    const fullPath = [
        ...path,
        ...issueData.path || []
    ];
    const fullIssue = {
        ...issueData,
        path: fullPath
    };
    let errorMessage = "";
    const maps = errorMaps.filter((m)=>!!m
    ).slice().reverse();
    for (const map of maps){
        errorMessage = map(fullIssue, {
            data,
            defaultError: errorMessage
        }).message;
    }
    return {
        ...issueData,
        path: fullPath,
        message: issueData.message || errorMessage
    };
};
const pathToArray = (path)=>{
    if (path === null) return [];
    const arr = new Array(path.count);
    while(path !== null){
        arr[path.count - 1] = path.component;
        path = path.parent;
    }
    return arr;
};
const pathFromArray = (arr)=>{
    let path = null;
    for(let i = 0; i < arr.length; i++){
        path = {
            parent: path,
            component: arr[i],
            count: i + 1
        };
    }
    return path;
};
class ParseContext {
    def;
    constructor(def){
        this.def = def;
    }
    get path() {
        return this.def.path;
    }
    get issues() {
        return this.def.issues;
    }
    get errorMap() {
        return this.def.errorMap;
    }
    get async() {
        return this.def.async;
    }
    stepInto(component) {
        return new ParseContext({
            ...this.def,
            path: this.path === null ? {
                parent: null,
                count: 1,
                component
            } : {
                parent: this.path,
                count: this.path.count + 1,
                component
            }
        });
    }
    addIssue(data, issueData, params = {
    }) {
        const issue = makeIssue({
            data,
            issueData,
            path: pathToArray(this.path),
            errorMaps: [
                this.def.errorMap,
                params.schemaErrorMap,
                overrideErrorMap,
                defaultErrorMap
            ]
        });
        this.issues.push(issue);
    }
}
const INVALID = Object.freeze({
    valid: false
});
const OK = (value)=>({
        valid: true,
        value
    })
;
const isInvalid = (x)=>x.valid === false
;
const isOk = (x)=>x.valid === true
;
const isAsync = (x)=>x instanceof Promise
;
var errorUtil;
(function(errorUtil) {
    errorUtil.errToObj = (message)=>typeof message === "string" ? {
            message
        } : message || {
        }
    ;
    errorUtil.toString = (message)=>typeof message === "string" ? message : message?.message
    ;
})(errorUtil || (errorUtil = {
}));
const createRootContext = (params)=>new ParseContext({
        path: pathFromArray(params.path || []),
        issues: [],
        errorMap: params.errorMap,
        async: params.async ?? false
    })
;
const handleResult = (ctx, result)=>{
    if (isOk(result) && !ctx.issues.length) {
        return {
            success: true,
            data: result.value
        };
    } else {
        const error = new ZodError(ctx.issues);
        return {
            success: false,
            error
        };
    }
};
function processCreateParams(params) {
    if (!params) return {
    };
    if (params.errorMap && (params.invalid_type_error || params.required_error)) {
        throw new Error(`Can't use "invalid" or "required" in conjunction with custom error map.`);
    }
    if (params.errorMap) return {
        errorMap: params.errorMap
    };
    const customMap = (iss, ctx)=>{
        if (iss.code !== "invalid_type") return {
            message: ctx.defaultError
        };
        if (typeof ctx.data === "undefined" && params.required_error) return {
            message: params.required_error
        };
        if (params.invalid_type_error) return {
            message: params.invalid_type_error
        };
        return {
            message: ctx.defaultError
        };
    };
    return {
        errorMap: customMap
    };
}
class ZodType {
    _type;
    _output;
    _input;
    _def;
    _addIssue(ctx, issueData, params) {
        ctx.addIssue(params.data, issueData, {
            schemaErrorMap: this._def.errorMap
        });
    }
    _parseSync(_ctx, _data, _parsedType) {
        const result = this._parse(_ctx, _data, _parsedType);
        if (isAsync(result)) {
            throw new Error("Synchronous parse encountered promise.");
        }
        return result;
    }
    _parseAsync(_ctx, _data, _parsedType) {
        const result = this._parse(_ctx, _data, _parsedType);
        return Promise.resolve(result);
    }
    parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success) return result.data;
        throw result.error;
    }
    safeParse(data, params) {
        const ctx = createRootContext({
            ...params,
            async: false
        });
        const result = this._parseSync(ctx, data, getParsedType(data));
        return handleResult(ctx, result);
    }
    async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success) return result.data;
        throw result.error;
    }
    async safeParseAsync(data, params) {
        const ctx = createRootContext({
            ...params,
            async: true
        });
        const maybeAsyncResult = this._parse(ctx, data, getParsedType(data));
        const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
    }
    spa = this.safeParseAsync;
    is;
    check;
    refine(check, message) {
        const getIssueProperties = (val)=>{
            if (typeof message === "string" || typeof message === "undefined") {
                return {
                    message
                };
            } else if (typeof message === "function") {
                return message(val);
            } else {
                return message;
            }
        };
        return this._refinement((val, ctx)=>{
            const result = check(val);
            const setError = ()=>ctx.addIssue({
                    code: ZodIssueCode.custom,
                    ...getIssueProperties(val)
                })
            ;
            if (result instanceof Promise) {
                return result.then((data)=>{
                    if (!data) {
                        setError();
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            if (!result) {
                setError();
                return false;
            } else {
                return true;
            }
        });
    }
    refinement(check, refinementData) {
        return this._refinement((val, ctx)=>{
            if (!check(val)) {
                ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
                return false;
            } else {
                return true;
            }
        });
    }
    _refinement(refinement) {
        return new ZodEffects({
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: {
                type: "refinement",
                refinement
            }
        });
    }
    superRefine = this._refinement;
    constructor(def){
        this._def = def;
        this.transform = this.transform.bind(this);
        this.default = this.default.bind(this);
    }
    optional() {
        return ZodOptional.create(this);
    }
    nullable() {
        return ZodNullable.create(this);
    }
    nullish() {
        return this.optional().nullable();
    }
    array() {
        return ZodArray.create(this);
    }
    promise() {
        return ZodPromise.create(this);
    }
    or(option) {
        return ZodUnion.create([
            this,
            option
        ]);
    }
    and(incoming) {
        return ZodIntersection.create(this, incoming);
    }
    transform(transform) {
        return new ZodEffects({
            schema: this,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect: {
                type: "transform",
                transform
            }
        });
    }
    default(def) {
        const defaultValueFunc = typeof def === "function" ? def : ()=>def
        ;
        return new ZodDefault({
            innerType: this,
            defaultValue: defaultValueFunc,
            typeName: ZodFirstPartyTypeKind.ZodDefault
        });
    }
    isOptional() {
        return this.safeParse(undefined).success;
    }
    isNullable() {
        return this.safeParse(null).success;
    }
}
const cuidRegex = /^c[^\s-]{8,}$/i;
const uuidRegex = /^([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}|00000000-0000-0000-0000-000000000000)$/i;
const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
class ZodString extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.string) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.string,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        for (const check of this._def.checks){
            if (check.kind === "min") {
                if (data.length < check.value) {
                    this._addIssue(ctx, {
                        code: ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "string",
                        inclusive: true,
                        message: check.message
                    }, {
                        data
                    });
                }
            } else if (check.kind === "max") {
                if (data.length > check.value) {
                    this._addIssue(ctx, {
                        code: ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "string",
                        inclusive: true,
                        message: check.message
                    }, {
                        data
                    });
                }
            } else if (check.kind === "email") {
                if (!emailRegex.test(data)) {
                    this._addIssue(ctx, {
                        validation: "email",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    }, {
                        data
                    });
                }
            } else if (check.kind === "uuid") {
                if (!uuidRegex.test(data)) {
                    this._addIssue(ctx, {
                        validation: "uuid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    }, {
                        data
                    });
                }
            } else if (check.kind === "cuid") {
                if (!cuidRegex.test(data)) {
                    this._addIssue(ctx, {
                        validation: "cuid",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    }, {
                        data
                    });
                }
            } else if (check.kind === "url") {
                try {
                    new URL(data);
                } catch  {
                    this._addIssue(ctx, {
                        validation: "url",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    }, {
                        data
                    });
                }
            } else if (check.kind === "regex") {
                if (!check.regex.test(data)) {
                    this._addIssue(ctx, {
                        validation: "regex",
                        code: ZodIssueCode.invalid_string,
                        message: check.message
                    }, {
                        data
                    });
                }
            }
        }
        return false ? INVALID : OK(data);
    }
    _regex = (regex, validation, message)=>this.refinement((data)=>regex.test(data)
        , {
            validation,
            code: ZodIssueCode.invalid_string,
            ...errorUtil.errToObj(message)
        })
    ;
    _addCheck(check) {
        return new ZodString({
            ...this._def,
            checks: [
                ...this._def.checks,
                check
            ]
        });
    }
    email(message) {
        return this._addCheck({
            kind: "email",
            ...errorUtil.errToObj(message)
        });
    }
    url(message) {
        return this._addCheck({
            kind: "url",
            ...errorUtil.errToObj(message)
        });
    }
    uuid(message) {
        return this._addCheck({
            kind: "uuid",
            ...errorUtil.errToObj(message)
        });
    }
    cuid(message) {
        return this._addCheck({
            kind: "cuid",
            ...errorUtil.errToObj(message)
        });
    }
    regex(regex, message) {
        return this._addCheck({
            kind: "regex",
            regex: regex,
            ...errorUtil.errToObj(message)
        });
    }
    min(minLength, message) {
        return this._addCheck({
            kind: "min",
            value: minLength,
            ...errorUtil.errToObj(message)
        });
    }
    max(maxLength, message) {
        return this._addCheck({
            kind: "max",
            value: maxLength,
            ...errorUtil.errToObj(message)
        });
    }
    length(len, message) {
        return this.min(len, message).max(len, message);
    }
    nonempty = (message)=>this.min(1, errorUtil.errToObj(message))
    ;
    get isEmail() {
        return !!this._def.checks.find((ch)=>ch.kind === "email"
        );
    }
    get isURL() {
        return !!this._def.checks.find((ch)=>ch.kind === "url"
        );
    }
    get isUUID() {
        return !!this._def.checks.find((ch)=>ch.kind === "uuid"
        );
    }
    get minLength() {
        let min = -Infinity;
        this._def.checks.map((ch)=>{
            if (ch.kind === "min") {
                if (min === null || ch.value > min) {
                    min = ch.value;
                }
            }
        });
        return min;
    }
    get maxLength() {
        let max = null;
        this._def.checks.map((ch)=>{
            if (ch.kind === "max") {
                if (max === null || ch.value < max) {
                    max = ch.value;
                }
            }
        });
        return max;
    }
    static create = (params)=>{
        return new ZodString({
            checks: [],
            typeName: ZodFirstPartyTypeKind.ZodString,
            ...processCreateParams(params)
        });
    };
}
class ZodNumber extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.number) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.number,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        for (const check of this._def.checks){
            if (check.kind === "int") {
                if (!util.isInteger(data)) {
                    this._addIssue(ctx, {
                        code: ZodIssueCode.invalid_type,
                        expected: "integer",
                        received: "float",
                        message: check.message
                    }, {
                        data
                    });
                }
            } else if (check.kind === "min") {
                const tooSmall = check.inclusive ? data < check.value : data <= check.value;
                if (tooSmall) {
                    this._addIssue(ctx, {
                        code: ZodIssueCode.too_small,
                        minimum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        message: check.message
                    }, {
                        data
                    });
                }
            } else if (check.kind === "max") {
                const tooBig = check.inclusive ? data > check.value : data >= check.value;
                if (tooBig) {
                    this._addIssue(ctx, {
                        code: ZodIssueCode.too_big,
                        maximum: check.value,
                        type: "number",
                        inclusive: check.inclusive,
                        message: check.message
                    }, {
                        data
                    });
                }
            } else if (check.kind === "multipleOf") {
                if (data % check.value !== 0) {
                    this._addIssue(ctx, {
                        code: ZodIssueCode.not_multiple_of,
                        multipleOf: check.value,
                        message: check.message
                    }, {
                        data
                    });
                }
            } else {
                util.assertNever(check);
            }
        }
        return false ? INVALID : OK(data);
    }
    static create = (params)=>{
        return new ZodNumber({
            checks: [],
            typeName: ZodFirstPartyTypeKind.ZodNumber,
            ...processCreateParams(params),
            ...processCreateParams(params)
        });
    };
    gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    min = this.gte;
    gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    max = this.lte;
    lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
        return new ZodNumber({
            ...this._def,
            checks: [
                ...this._def.checks,
                {
                    kind,
                    value,
                    inclusive,
                    message: errorUtil.toString(message)
                }, 
            ]
        });
    }
    _addCheck(check) {
        return new ZodNumber({
            ...this._def,
            checks: [
                ...this._def.checks,
                check
            ]
        });
    }
    int(message) {
        return this._addCheck({
            kind: "int",
            message: errorUtil.toString(message)
        });
    }
    positive(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message)
        });
    }
    negative(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: false,
            message: errorUtil.toString(message)
        });
    }
    nonpositive(message) {
        return this._addCheck({
            kind: "max",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message)
        });
    }
    nonnegative(message) {
        return this._addCheck({
            kind: "min",
            value: 0,
            inclusive: true,
            message: errorUtil.toString(message)
        });
    }
    multipleOf(value, message) {
        return this._addCheck({
            kind: "multipleOf",
            value: value,
            message: errorUtil.toString(message)
        });
    }
    step = this.multipleOf;
    get minValue() {
        let min = null;
        for (const ch of this._def.checks){
            if (ch.kind === "min") {
                if (min === null || ch.value > min) min = ch.value;
            }
        }
        return min;
    }
    get maxValue() {
        let max = null;
        for (const ch of this._def.checks){
            if (ch.kind === "max") {
                if (max === null || ch.value < max) max = ch.value;
            }
        }
        return max;
    }
    get isInt() {
        return !!this._def.checks.find((ch)=>ch.kind === "int"
        );
    }
}
class ZodBigInt extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.bigint) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.bigint,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        return OK(data);
    }
    static create = (params)=>{
        return new ZodBigInt({
            typeName: ZodFirstPartyTypeKind.ZodBigInt,
            ...processCreateParams(params)
        });
    };
}
class ZodBoolean extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.boolean) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.boolean,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        return OK(data);
    }
    static create = (params)=>{
        return new ZodBoolean({
            typeName: ZodFirstPartyTypeKind.ZodBoolean,
            ...processCreateParams(params)
        });
    };
}
class ZodDate extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.date) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.date,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        if (isNaN(data.getTime())) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_date
            }, {
                data
            });
            return INVALID;
        }
        return OK(new Date(data.getTime()));
    }
    static create = (params)=>{
        return new ZodDate({
            typeName: ZodFirstPartyTypeKind.ZodDate,
            ...processCreateParams(params)
        });
    };
}
class ZodUndefined extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.undefined) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.undefined,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        return OK(data);
    }
    params;
    static create = (params)=>{
        return new ZodUndefined({
            typeName: ZodFirstPartyTypeKind.ZodUndefined,
            ...processCreateParams(params)
        });
    };
}
class ZodNull extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.null) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.null,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        return OK(data);
    }
    static create = (params)=>{
        return new ZodNull({
            typeName: ZodFirstPartyTypeKind.ZodNull,
            ...processCreateParams(params)
        });
    };
}
class ZodAny extends ZodType {
    _any = true;
    _parse(_ctx, data, _parsedType) {
        return OK(data);
    }
    static create = (params)=>{
        return new ZodAny({
            typeName: ZodFirstPartyTypeKind.ZodAny,
            ...processCreateParams(params)
        });
    };
}
class ZodUnknown extends ZodType {
    _unknown = true;
    _parse(_ctx, data, _parsedType) {
        return OK(data);
    }
    static create = (params)=>{
        return new ZodUnknown({
            typeName: ZodFirstPartyTypeKind.ZodUnknown,
            ...processCreateParams(params)
        });
    };
}
class ZodNever extends ZodType {
    _parse(ctx, data, parsedType) {
        this._addIssue(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.never,
            received: parsedType
        }, {
            data
        });
        return INVALID;
    }
    static create = (params)=>{
        return new ZodNever({
            typeName: ZodFirstPartyTypeKind.ZodNever,
            ...processCreateParams(params)
        });
    };
}
class ZodVoid extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.undefined) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.void,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        return OK(data);
    }
    static create = (params)=>{
        return new ZodVoid({
            typeName: ZodFirstPartyTypeKind.ZodVoid,
            ...processCreateParams(params)
        });
    };
}
class ZodArray extends ZodType {
    _parse(ctx, _data, parsedType) {
        const def = this._def;
        if (parsedType !== ZodParsedType.array) {
            ctx.addIssue(_data, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.array,
                received: parsedType
            });
            return INVALID;
        }
        const data = _data;
        let invalid = false;
        if (def.minLength !== null) {
            if (data.length < def.minLength.value) {
                this._addIssue(ctx, {
                    code: ZodIssueCode.too_small,
                    minimum: def.minLength.value,
                    type: "array",
                    inclusive: true,
                    message: def.minLength.message
                }, {
                    data
                });
            }
        }
        if (def.maxLength !== null) {
            if (data.length > def.maxLength.value) {
                this._addIssue(ctx, {
                    code: ZodIssueCode.too_big,
                    maximum: def.maxLength.value,
                    type: "array",
                    inclusive: true,
                    message: def.maxLength.message
                }, {
                    data
                });
            }
        }
        const tasks = [];
        const result = new Array(data.length);
        const type = def.type;
        const handleParsed = (index, parsedItem)=>{
            if (isOk(parsedItem)) {
                result[index] = parsedItem.value;
            } else if (isInvalid(parsedItem)) {
                invalid = true;
            } else {
                tasks.push(parsedItem.then((parsed)=>handleParsed(index, parsed)
                ));
            }
        };
        data.forEach((item, index)=>{
            handleParsed(index, type._parse(ctx.stepInto(index), item, getParsedType(item)));
        });
        if (ctx.async) {
            return Promise.all(tasks).then(()=>invalid ? INVALID : OK(result)
            );
        } else {
            return invalid ? INVALID : OK(result);
        }
    }
    get element() {
        return this._def.type;
    }
    min(minLength, message) {
        return new ZodArray({
            ...this._def,
            minLength: {
                value: minLength,
                message: errorUtil.toString(message)
            }
        });
    }
    max(maxLength, message) {
        return new ZodArray({
            ...this._def,
            maxLength: {
                value: maxLength,
                message: errorUtil.toString(message)
            }
        });
    }
    length(len, message) {
        return this.min(len, message).max(len, message);
    }
    nonempty(message) {
        return this.min(1, message);
    }
    static create = (schema, params)=>{
        return new ZodArray({
            type: schema,
            minLength: null,
            maxLength: null,
            typeName: ZodFirstPartyTypeKind.ZodArray,
            ...processCreateParams(params)
        });
    };
}
var objectUtil;
(function(objectUtil) {
    objectUtil.mergeShapes = (first, second)=>{
        return {
            ...first,
            ...second
        };
    };
    objectUtil.intersectShapes = (first, second)=>{
        const firstKeys = util.objectKeys(first);
        const secondKeys = util.objectKeys(second);
        const sharedKeys = firstKeys.filter((k)=>secondKeys.indexOf(k) !== -1
        );
        const sharedShape = {
        };
        for (const k of sharedKeys){
            sharedShape[k] = ZodIntersection.create(first[k], second[k]);
        }
        return {
            ...first,
            ...second,
            ...sharedShape
        };
    };
})(objectUtil || (objectUtil = {
}));
const mergeObjects = (first)=>(second)=>{
        const mergedShape = objectUtil.mergeShapes(first._def.shape(), second._def.shape());
        const merged = new ZodObject({
            unknownKeys: first._def.unknownKeys,
            catchall: first._def.catchall,
            shape: ()=>mergedShape
            ,
            typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
    }
;
const AugmentFactory = (def)=>(augmentation)=>{
        return new ZodObject({
            ...def,
            shape: ()=>({
                    ...def.shape(),
                    ...augmentation
                })
        });
    }
;
function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
        const newShape = {
        };
        for(const key in schema.shape){
            const fieldSchema = schema.shape[key];
            newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
        }
        return new ZodObject({
            ...schema._def,
            shape: ()=>newShape
        });
    } else if (schema instanceof ZodArray) {
        return ZodArray.create(deepPartialify(schema.element));
    } else if (schema instanceof ZodOptional) {
        return ZodOptional.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodNullable) {
        return ZodNullable.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodTuple) {
        return ZodTuple.create(schema.items.map((item)=>deepPartialify(item)
        ));
    } else {
        return schema;
    }
}
class ZodObject extends ZodType {
    _shape;
    _unknownKeys;
    _catchall;
    _cached = null;
    _getCached() {
        if (this._cached !== null) return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        return this._cached = {
            shape,
            keys
        };
    }
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.object) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        const { shape , keys: shapeKeys  } = this._getCached();
        let invalid = false;
        const tasks = [];
        const resultObject = {
        };
        const handleParsed = (key, parsedValue)=>{
            if (isOk(parsedValue)) {
                const value = parsedValue.value;
                if (typeof value !== "undefined" || key in data) {
                    resultObject[key] = value;
                }
            } else if (isInvalid(parsedValue)) {
                invalid = true;
            } else {
                tasks.push(parsedValue.then((parsed)=>handleParsed(key, parsed)
                ));
            }
        };
        for (const key of shapeKeys){
            const keyValidator = shape[key];
            const value = data[key];
            handleParsed(key, keyValidator._parse(ctx.stepInto(key), value, getParsedType(value)));
        }
        if (this._def.catchall instanceof ZodNever) {
            const unknownKeys = this._def.unknownKeys;
            if (unknownKeys === "passthrough") {
                const dataKeys = util.objectKeys(data);
                const extraKeys = dataKeys.filter((k)=>!(k in shape)
                );
                for (const key of extraKeys){
                    resultObject[key] = data[key];
                }
            } else if (unknownKeys === "strict") {
                const dataKeys = util.objectKeys(data);
                const extraKeys = dataKeys.filter((k)=>!(k in shape)
                );
                if (extraKeys.length > 0) {
                    this._addIssue(ctx, {
                        code: ZodIssueCode.unrecognized_keys,
                        keys: extraKeys
                    }, {
                        data
                    });
                }
            } else if (unknownKeys === "strip") {
            } else {
                throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
            }
        } else {
            const catchall = this._def.catchall;
            const dataKeys = util.objectKeys(data);
            const extraKeys = dataKeys.filter((k)=>!(k in shape)
            );
            for (const key of extraKeys){
                const value = data[key];
                handleParsed(key, catchall._parse(ctx.stepInto(key), value, getParsedType(value)));
            }
        }
        if (ctx.async) {
            return Promise.all(tasks).then(()=>invalid ? INVALID : OK(resultObject)
            );
        } else {
            return invalid ? INVALID : OK(resultObject);
        }
    }
    get shape() {
        return this._def.shape();
    }
    strict() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "strict"
        });
    }
    strip() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "strip"
        });
    }
    passthrough() {
        return new ZodObject({
            ...this._def,
            unknownKeys: "passthrough"
        });
    }
    nonstrict = this.passthrough;
    augment = AugmentFactory(this._def);
    extend = AugmentFactory(this._def);
    setKey(key, schema) {
        return this.augment({
            [key]: schema
        });
    }
    merge(merging) {
        const mergedShape = objectUtil.mergeShapes(this._def.shape(), merging._def.shape());
        const merged = new ZodObject({
            unknownKeys: merging._def.unknownKeys,
            catchall: merging._def.catchall,
            shape: ()=>mergedShape
            ,
            typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
    }
    catchall(index) {
        return new ZodObject({
            ...this._def,
            catchall: index
        });
    }
    pick(mask) {
        const shape = {
        };
        util.objectKeys(mask).map((key)=>{
            shape[key] = this.shape[key];
        });
        return new ZodObject({
            ...this._def,
            shape: ()=>shape
        });
    }
    omit(mask) {
        const shape = {
        };
        util.objectKeys(this.shape).map((key)=>{
            if (util.objectKeys(mask).indexOf(key) === -1) {
                shape[key] = this.shape[key];
            }
        });
        return new ZodObject({
            ...this._def,
            shape: ()=>shape
        });
    }
    deepPartial() {
        return deepPartialify(this);
    }
    partial(mask) {
        const newShape = {
        };
        if (mask) {
            util.objectKeys(this.shape).map((key)=>{
                if (util.objectKeys(mask).indexOf(key) === -1) {
                    newShape[key] = this.shape[key];
                } else {
                    newShape[key] = this.shape[key].optional();
                }
            });
            return new ZodObject({
                ...this._def,
                shape: ()=>newShape
            });
        } else {
            for(const key in this.shape){
                const fieldSchema = this.shape[key];
                newShape[key] = fieldSchema.optional();
            }
        }
        return new ZodObject({
            ...this._def,
            shape: ()=>newShape
        });
    }
    required() {
        const newShape = {
        };
        for(const key in this.shape){
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while(newField instanceof ZodOptional){
                newField = newField._def.innerType;
            }
            newShape[key] = newField;
        }
        return new ZodObject({
            ...this._def,
            shape: ()=>newShape
        });
    }
    static create = (shape, params)=>{
        return new ZodObject({
            shape: ()=>shape
            ,
            unknownKeys: "strip",
            catchall: ZodNever.create(),
            typeName: ZodFirstPartyTypeKind.ZodObject,
            ...processCreateParams(params)
        });
    };
    static strictCreate = (shape, params)=>{
        return new ZodObject({
            shape: ()=>shape
            ,
            unknownKeys: "strict",
            catchall: ZodNever.create(),
            typeName: ZodFirstPartyTypeKind.ZodObject,
            ...processCreateParams(params)
        });
    };
    static lazycreate = (shape, params)=>{
        return new ZodObject({
            shape,
            unknownKeys: "strip",
            catchall: ZodNever.create(),
            typeName: ZodFirstPartyTypeKind.ZodObject,
            ...processCreateParams(params)
        });
    };
}
class ZodUnion extends ZodType {
    _parse(ctx, data, parsedType) {
        const options = this._def.options;
        const noMatch = (allIssues)=>{
            const unionErrors = allIssues.map((issues)=>new ZodError(issues)
            );
            const nonTypeErrors = unionErrors.filter((err)=>{
                return err.issues[0].code !== "invalid_type";
            });
            if (nonTypeErrors.length === 1) {
                nonTypeErrors[0].issues.forEach((issue)=>ctx.issues.push(issue)
                );
            } else {
                this._addIssue(ctx, {
                    code: ZodIssueCode.invalid_union,
                    unionErrors
                }, {
                    data
                });
            }
            return INVALID;
        };
        if (ctx.async) {
            const contexts = options.map(()=>new ParseContext({
                    ...ctx.def,
                    issues: []
                })
            );
            return Promise.all(options.map((option, index)=>option._parse(contexts[index], data, parsedType)
            )).then((parsedOptions)=>{
                for (const parsedOption of parsedOptions){
                    if (isOk(parsedOption)) {
                        return parsedOption;
                    }
                }
                return noMatch(contexts.map((ctx)=>ctx.issues
                ));
            });
        } else {
            const allIssues = [];
            for (const option of options){
                const optionCtx = new ParseContext({
                    ...ctx.def,
                    issues: []
                });
                const parsedOption = option._parseSync(optionCtx, data, parsedType);
                if (isInvalid(parsedOption)) {
                    allIssues.push(optionCtx.issues);
                } else {
                    return parsedOption;
                }
            }
            return noMatch(allIssues);
        }
    }
    get options() {
        return this._def.options;
    }
    static create = (types, params)=>{
        return new ZodUnion({
            options: types,
            typeName: ZodFirstPartyTypeKind.ZodUnion,
            ...processCreateParams(params)
        });
    };
}
function mergeValues(a, b) {
    const aType = getParsedType(a);
    const bType = getParsedType(b);
    if (a === b) {
        return {
            valid: true,
            data: a
        };
    } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
        const bKeys = util.objectKeys(b);
        const sharedKeys = util.objectKeys(a).filter((key)=>bKeys.indexOf(key) !== -1
        );
        const newObj = {
            ...a,
            ...b
        };
        for (const key of sharedKeys){
            const sharedValue = mergeValues(a[key], b[key]);
            if (!sharedValue.valid) {
                return {
                    valid: false
                };
            }
            newObj[key] = sharedValue.data;
        }
        return {
            valid: true,
            data: newObj
        };
    } else {
        return {
            valid: false
        };
    }
}
class ZodIntersection extends ZodType {
    _parse(ctx, data, parsedType) {
        const handleParsed = (parsedLeft, parsedRight)=>{
            if (isInvalid(parsedLeft) || isInvalid(parsedRight)) {
                return INVALID;
            }
            const merged = mergeValues(parsedLeft.value, parsedRight.value);
            if (!merged.valid) {
                this._addIssue(ctx, {
                    code: ZodIssueCode.invalid_intersection_types
                }, {
                    data
                });
                return INVALID;
            }
            return OK(merged.data);
        };
        if (ctx.async) {
            return Promise.all([
                this._def.left._parse(ctx, data, parsedType),
                this._def.right._parse(ctx, data, parsedType), 
            ]).then(([left, right])=>handleParsed(left, right)
            );
        } else {
            return handleParsed(this._def.left._parseSync(ctx, data, parsedType), this._def.right._parseSync(ctx, data, parsedType));
        }
    }
    static create = (left, right, params)=>{
        return new ZodIntersection({
            left: left,
            right: right,
            typeName: ZodFirstPartyTypeKind.ZodIntersection,
            ...processCreateParams(params)
        });
    };
}
class ZodTuple extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.array) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.array,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && data.length > this._def.items.length) {
            this._addIssue(ctx, {
                code: ZodIssueCode.too_big,
                maximum: this._def.items.length,
                inclusive: true,
                type: "array"
            }, {
                data
            });
            return INVALID;
        }
        if (data.length < this._def.items.length) {
            this._addIssue(ctx, {
                code: ZodIssueCode.too_small,
                minimum: this._def.items.length,
                inclusive: true,
                type: "array"
            }, {
                data
            });
            return INVALID;
        }
        const tasks = [];
        const items = this._def.items;
        const parseResult = new Array(data.length);
        let invalid = false;
        const handleParsed = (index, parsedItem)=>{
            if (isOk(parsedItem)) {
                parseResult[index] = parsedItem.value;
            } else if (isInvalid(parsedItem)) {
                invalid = true;
            } else {
                tasks.push(parsedItem.then((parsed)=>handleParsed(index, parsed)
                ));
            }
        };
        items.forEach((item, index)=>{
            handleParsed(index, item._parse(ctx.stepInto(index), data[index], getParsedType(data[index])));
        });
        if (rest) {
            const restData = data.slice(items.length);
            restData.forEach((dataItem, _index)=>{
                const index = _index + items.length;
                handleParsed(index, rest._parse(ctx.stepInto(index), dataItem, getParsedType(dataItem)));
            });
        }
        if (ctx.async) {
            return Promise.all(tasks).then(()=>invalid ? INVALID : OK(parseResult)
            );
        } else {
            return invalid ? INVALID : OK(parseResult);
        }
    }
    get items() {
        return this._def.items;
    }
    rest(rest) {
        return new ZodTuple({
            ...this._def,
            rest
        });
    }
    static create = (schemas, params)=>{
        return new ZodTuple({
            items: schemas,
            typeName: ZodFirstPartyTypeKind.ZodTuple,
            rest: null,
            ...processCreateParams(params)
        });
    };
}
class ZodRecord extends ZodType {
    get keySchema() {
        return this._def.keyType;
    }
    get valueSchema() {
        return this._def.valueType;
    }
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.object) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.object,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        const tasks = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const parseResult = {
        };
        let invalid = false;
        const handleParsed = (parsedKey, parsedValue)=>{
            if (isOk(parsedKey) && isOk(parsedValue)) {
                parseResult[parsedKey.value] = parsedValue.value;
            } else if (isAsync(parsedKey) || isAsync(parsedValue)) {
                tasks.push(Promise.all([
                    parsedKey,
                    parsedValue
                ]).then(([k, v])=>handleParsed(k, v)
                ));
            } else {
                invalid = true;
            }
        };
        for(const key in data){
            handleParsed(keyType._parse(ctx.stepInto(key), key, getParsedType(key)), valueType._parse(ctx.stepInto(key), data[key], getParsedType(data[key])));
        }
        if (ctx.async) {
            return Promise.all(tasks).then(()=>invalid ? INVALID : OK(parseResult)
            );
        } else {
            return invalid ? INVALID : OK(parseResult);
        }
    }
    get element() {
        return this._def.valueType;
    }
    static create(first, second, third) {
        if (second instanceof ZodType) {
            return new ZodRecord({
                keyType: first,
                valueType: second,
                typeName: ZodFirstPartyTypeKind.ZodRecord,
                ...processCreateParams(third)
            });
        }
        return new ZodRecord({
            keyType: ZodString.create(),
            valueType: first,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(second)
        });
    }
}
class ZodMap extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.map) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.map,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const dataMap = data;
        const parseResult = new Map();
        const tasks = [];
        let invalid = false;
        const handleParsed = (parsedKey, parsedValue)=>{
            if (isAsync(parsedKey) || isAsync(parsedValue)) {
                tasks.push(Promise.all([
                    parsedKey,
                    parsedValue
                ]).then(([k, v])=>handleParsed(k, v)
                ));
            } else if (isInvalid(parsedKey) || isInvalid(parsedValue)) {
                invalid = true;
            } else {
                parseResult.set(parsedKey.value, parsedValue.value);
            }
        };
        [
            ...dataMap.entries()
        ].forEach(([key, value], index)=>{
            const entryCtx = ctx.stepInto(index);
            const parsedKey = keyType._parse(entryCtx.stepInto("key"), key, getParsedType(key));
            const parsedValue = valueType._parse(entryCtx.stepInto("value"), value, getParsedType(value));
            handleParsed(parsedKey, parsedValue);
        });
        if (ctx.async) {
            return Promise.all(tasks).then(()=>invalid ? INVALID : OK(parseResult)
            );
        } else {
            return invalid ? INVALID : OK(parseResult);
        }
    }
    static create = (keyType, valueType, params)=>{
        return new ZodMap({
            valueType,
            keyType,
            typeName: ZodFirstPartyTypeKind.ZodMap,
            ...processCreateParams(params)
        });
    };
}
class ZodSet extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.set) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.set,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        const dataSet = data;
        const valueType = this._def.valueType;
        const parsedSet = new Set();
        const tasks = [];
        let invalid = false;
        const handleParsed = (parsedItem)=>{
            if (isOk(parsedItem)) {
                parsedSet.add(parsedItem.value);
            } else if (isInvalid(parsedItem)) {
                invalid = true;
            } else {
                tasks.push(parsedItem.then((parsed)=>handleParsed(parsed)
                ));
            }
        };
        [
            ...dataSet.values()
        ].forEach((item, i)=>handleParsed(valueType._parse(ctx.stepInto(i), item, getParsedType(item)))
        );
        if (ctx.async) {
            return Promise.all(tasks).then(()=>invalid ? INVALID : OK(parsedSet)
            );
        } else {
            return invalid ? INVALID : OK(parsedSet);
        }
    }
    static create = (valueType, params)=>{
        return new ZodSet({
            valueType,
            typeName: ZodFirstPartyTypeKind.ZodSet,
            ...processCreateParams(params)
        });
    };
}
class ZodFunction extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.function) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.function,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        function makeArgsIssue(args, error) {
            return makeIssue({
                data: args,
                path: pathToArray(ctx.path),
                errorMaps: [
                    ctx.errorMap
                ],
                issueData: {
                    code: ZodIssueCode.invalid_arguments,
                    argumentsError: error
                }
            });
        }
        function makeReturnsIssue(returns, error) {
            return makeIssue({
                data: returns,
                path: pathToArray(ctx.path),
                errorMaps: [
                    ctx.errorMap
                ],
                issueData: {
                    code: ZodIssueCode.invalid_return_type,
                    returnTypeError: error
                }
            });
        }
        const params = {
            errorMap: ctx.errorMap
        };
        const fn = data;
        if (this._def.returns instanceof ZodPromise) {
            return OK(async (...args)=>{
                const error = new ZodError([]);
                const parsedArgs = await this._def.args.parseAsync(args, params).catch((e)=>{
                    error.addIssue(makeArgsIssue(args, e));
                    throw error;
                });
                const result = await fn(...parsedArgs);
                const parsedReturns = await this._def.returns.parseAsync(result, params).catch((e)=>{
                    error.addIssue(makeReturnsIssue(result, e));
                    throw error;
                });
                return parsedReturns;
            });
        } else {
            return OK((...args)=>{
                const parsedArgs = this._def.args.safeParse(args, params);
                if (!parsedArgs.success) {
                    throw new ZodError([
                        makeArgsIssue(args, parsedArgs.error)
                    ]);
                }
                const result = fn(...parsedArgs.data);
                const parsedReturns = this._def.returns.safeParse(result, params);
                if (!parsedReturns.success) {
                    throw new ZodError([
                        makeReturnsIssue(result, parsedReturns.error)
                    ]);
                }
                return parsedReturns.data;
            });
        }
    }
    parameters() {
        return this._def.args;
    }
    returnType() {
        return this._def.returns;
    }
    args(...items) {
        return new ZodFunction({
            ...this._def,
            args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
    }
    returns(returnType) {
        return new ZodFunction({
            ...this._def,
            returns: returnType
        });
    }
    implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
    }
    validate = this.implement;
    static create = (args, returns, params)=>{
        return new ZodFunction({
            args: args ? args.rest(ZodUnknown.create()) : ZodTuple.create([]).rest(ZodUnknown.create()),
            returns: returns || ZodUnknown.create(),
            typeName: ZodFirstPartyTypeKind.ZodFunction,
            ...processCreateParams(params)
        });
    };
}
class ZodLazy extends ZodType {
    get schema() {
        return this._def.getter();
    }
    _parse(ctx, data, parsedType) {
        const lazySchema = this._def.getter();
        return lazySchema._parse(ctx, data, parsedType);
    }
    static create = (getter, params)=>{
        return new ZodLazy({
            getter: getter,
            typeName: ZodFirstPartyTypeKind.ZodLazy,
            ...processCreateParams(params)
        });
    };
}
class ZodLiteral extends ZodType {
    _parse(ctx, data, _parsedType) {
        if (data !== this._def.value) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: this._def.value,
                received: data
            }, {
                data
            });
            return INVALID;
        }
        return OK(data);
    }
    get value() {
        return this._def.value;
    }
    static create = (value, params)=>{
        return new ZodLiteral({
            value: value,
            typeName: ZodFirstPartyTypeKind.ZodLiteral,
            ...processCreateParams(params)
        });
    };
}
function createZodEnum(values) {
    return new ZodEnum({
        values: values,
        typeName: ZodFirstPartyTypeKind.ZodEnum
    });
}
class ZodEnum extends ZodType {
    _parse(ctx, data, _parsedType) {
        if (this._def.values.indexOf(data) === -1) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_enum_value,
                options: this._def.values
            }, {
                data
            });
            return INVALID;
        }
        return OK(data);
    }
    get options() {
        return this._def.values;
    }
    get enum() {
        const enumValues = {
        };
        for (const val of this._def.values){
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Values() {
        const enumValues = {
        };
        for (const val of this._def.values){
            enumValues[val] = val;
        }
        return enumValues;
    }
    get Enum() {
        const enumValues = {
        };
        for (const val of this._def.values){
            enumValues[val] = val;
        }
        return enumValues;
    }
    static create = createZodEnum;
}
class ZodNativeEnum extends ZodType {
    _parse(ctx, data, _parsedType) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        if (nativeEnumValues.indexOf(data) === -1) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_enum_value,
                options: util.objectValues(nativeEnumValues)
            }, {
                data
            });
            return INVALID;
        }
        return OK(data);
    }
    static create = (values, params)=>{
        return new ZodNativeEnum({
            values: values,
            typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
            ...processCreateParams(params)
        });
    };
}
class ZodPromise extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType !== ZodParsedType.promise && ctx.async === false) {
            this._addIssue(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: ZodParsedType.promise,
                received: parsedType
            }, {
                data
            });
            return INVALID;
        }
        const promisified = parsedType === ZodParsedType.promise ? data : Promise.resolve(data);
        return OK(promisified.then((data)=>{
            return this._def.type.parseAsync(data, {
                path: pathToArray(ctx.path),
                errorMap: ctx.errorMap
            });
        }));
    }
    static create = (schema, params)=>{
        return new ZodPromise({
            type: schema,
            typeName: ZodFirstPartyTypeKind.ZodPromise,
            ...processCreateParams(params)
        });
    };
}
class ZodEffects extends ZodType {
    innerType() {
        return this._def.schema;
    }
    _parse(ctx, initialData, initialParsedType) {
        const isSync = ctx.async === false;
        const effect = this._def.effect || null;
        const data = initialData;
        const parsedType = initialParsedType;
        if (effect.type === "preprocess") {
            const processed = effect.transform(initialData);
            if (ctx.async) {
                return Promise.resolve(processed).then((val)=>this._def.schema._parseAsync(ctx, val, getParsedType(val))
                );
            } else {
                const result = this._def.schema._parseSync(ctx, processed, getParsedType(processed));
                if (result instanceof Promise) throw new Error("Asynchronous preprocess step encountered during synchronous parse operation. Use .parseAsync instead.");
                return result;
            }
        }
        if (effect.type === "refinement") {
            const executeRefinement = (acc, effect)=>{
                const result = effect.refinement(acc, checkCtx);
                if (result instanceof Promise) {
                    if (isSync) {
                        throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
                    }
                    return result.then(()=>acc
                    );
                }
                return acc;
            };
            const _addIssue = (arg)=>{
                this._addIssue(ctx, arg, {
                    data
                });
            };
            const checkCtx = {
                addIssue: _addIssue,
                get path () {
                    return pathToArray(ctx.path);
                }
            };
            checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
            if (isSync) {
                const base = this._def.schema._parseSync(ctx, data, parsedType);
                if (isInvalid(base)) return INVALID;
                const result = executeRefinement(base.value, effect);
                return false ? INVALID : OK(result);
            } else {
                return this._def.schema._parseAsync(ctx, data, parsedType).then((result)=>{
                    if (isInvalid(result)) return INVALID;
                    return executeRefinement(result.value, effect);
                }).then((val)=>false ? INVALID : OK(val)
                );
            }
        }
        if (effect.type === "transform") {
            const applyTransform = (acc, effect)=>{
                const transformed = effect.transform(acc);
                if (transformed instanceof Promise && isSync) {
                    throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
                }
                return transformed;
            };
            if (isSync) {
                const base = this._def.schema._parseSync(ctx, data, parsedType);
                if (isInvalid(base)) return INVALID;
                const result = applyTransform(base.value, effect);
                return false ? INVALID : OK(result);
            } else {
                return this._def.schema._parseAsync(ctx, data, parsedType).then((base)=>{
                    if (isInvalid(base)) return INVALID;
                    return applyTransform(base.value, effect);
                }).then((val)=>false ? INVALID : OK(val)
                );
            }
        }
        util.assertNever(effect);
    }
    static create = (schema, effect, params)=>{
        return new ZodEffects({
            schema,
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            effect,
            ...processCreateParams(params)
        });
    };
    static createWithPreprocess = (preprocess, schema, params)=>{
        return new ZodEffects({
            schema,
            effect: {
                type: "preprocess",
                transform: preprocess
            },
            typeName: ZodFirstPartyTypeKind.ZodEffects,
            ...processCreateParams(params)
        });
    };
}
class ZodOptional extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType === ZodParsedType.undefined) {
            return OK(undefined);
        }
        return this._def.innerType._parse(ctx, data, parsedType);
    }
    unwrap() {
        return this._def.innerType;
    }
    static create = (type, params)=>{
        return new ZodOptional({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodOptional,
            ...processCreateParams(params)
        });
    };
}
class ZodNullable extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType === ZodParsedType.null) {
            return OK(null);
        }
        return this._def.innerType._parse(ctx, data, parsedType);
    }
    unwrap() {
        return this._def.innerType;
    }
    static create = (type, params)=>{
        return new ZodNullable({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodNullable,
            ...processCreateParams(params)
        });
    };
}
class ZodDefault extends ZodType {
    _parse(ctx, data, parsedType) {
        if (parsedType === ZodParsedType.undefined) {
            data = this._def.defaultValue();
        }
        return this._def.innerType._parse(ctx, data, getParsedType(data));
    }
    removeDefault() {
        return this._def.innerType;
    }
    static create = (type, params)=>{
        return new ZodOptional({
            innerType: type,
            typeName: ZodFirstPartyTypeKind.ZodOptional,
            ...processCreateParams(params)
        });
    };
}
const custom = (check, params)=>{
    if (check) return ZodAny.create().refine(check, params);
    return ZodAny.create();
};
const late = {
    object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind) {
    ZodFirstPartyTypeKind["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {
}));
const instanceOfType = (cls, params = {
    message: `Input not instance of ${cls.name}`
})=>custom((data)=>data instanceof cls
    , params)
;
const stringType = ZodString.create;
const numberType = ZodNumber.create;
const bigIntType = ZodBigInt.create;
const booleanType = ZodBoolean.create;
const dateType = ZodDate.create;
const undefinedType = ZodUndefined.create;
const nullType = ZodNull.create;
const anyType = ZodAny.create;
const unknownType = ZodUnknown.create;
const neverType = ZodNever.create;
const voidType = ZodVoid.create;
const arrayType = ZodArray.create;
const objectType = ZodObject.create;
const strictObjectType = ZodObject.strictCreate;
const unionType = ZodUnion.create;
const intersectionType = ZodIntersection.create;
const tupleType = ZodTuple.create;
const recordType = ZodRecord.create;
const mapType = ZodMap.create;
const setType = ZodSet.create;
const functionType = ZodFunction.create;
const lazyType = ZodLazy.create;
const literalType = ZodLiteral.create;
const enumType = ZodEnum.create;
const nativeEnumType = ZodNativeEnum.create;
const promiseType = ZodPromise.create;
const effectsType = ZodEffects.create;
const optionalType = ZodOptional.create;
const nullableType = ZodNullable.create;
const preprocessType = ZodEffects.createWithPreprocess;
const ostring = ()=>stringType().optional()
;
const onumber = ()=>numberType().optional()
;
const oboolean = ()=>booleanType().optional()
;
const mod = function() {
    return {
        ZodParsedType,
        getParsedType,
        makeIssue,
        EMPTY_PATH: null,
        pathToArray,
        pathFromArray,
        ParseContext,
        INVALID,
        OK,
        isInvalid,
        isOk,
        isAsync,
        ZodIssueCode,
        quotelessJson,
        ZodError,
        defaultErrorMap,
        overrideErrorMap,
        setErrorMap,
        ZodType,
        ZodString,
        ZodNumber,
        ZodBigInt,
        ZodBoolean,
        ZodDate,
        ZodUndefined,
        ZodNull,
        ZodAny,
        ZodUnknown,
        ZodNever,
        ZodVoid,
        ZodArray,
        objectUtil,
        mergeObjects,
        ZodObject,
        ZodUnion,
        ZodIntersection,
        ZodTuple,
        ZodRecord,
        ZodMap,
        ZodSet,
        ZodFunction,
        ZodLazy,
        ZodLiteral,
        ZodEnum,
        ZodNativeEnum,
        ZodPromise,
        ZodEffects,
        ZodTransformer: ZodEffects,
        ZodOptional,
        ZodNullable,
        ZodDefault,
        custom,
        Schema: ZodType,
        ZodSchema: ZodType,
        late,
        ZodFirstPartyTypeKind,
        any: anyType,
        array: arrayType,
        bigint: bigIntType,
        boolean: booleanType,
        date: dateType,
        effect: effectsType,
        enum: enumType,
        function: functionType,
        instanceof: instanceOfType,
        intersection: intersectionType,
        lazy: lazyType,
        literal: literalType,
        map: mapType,
        nativeEnum: nativeEnumType,
        never: neverType,
        null: nullType,
        nullable: nullableType,
        number: numberType,
        object: objectType,
        oboolean,
        onumber,
        optional: optionalType,
        ostring,
        preprocess: preprocessType,
        promise: promiseType,
        record: recordType,
        set: setType,
        strictObject: strictObjectType,
        string: stringType,
        transformer: effectsType,
        tuple: tupleType,
        undefined: undefinedType,
        union: unionType,
        unknown: unknownType,
        void: voidType
    };
}();
const paramSchema = mod.object({
    modelScale: mod.number().optional(),
    charaName: mod.string()
});
const motionSchema = mod.object({
    File: mod.string(),
    Expression: mod.string(),
    Sound: mod.string(),
    FadeIn: mod.number(),
    FadeOut: mod.number()
}).partial().passthrough();
const expressionSchema = mod.object({
    Name: mod.string(),
    File: mod.string()
}).passthrough();
const groupSchema = mod.object({
    Target: mod.string(),
    Name: mod.enum([
        "EyeBlink",
        "LipSync"
    ]),
    Ids: mod.array(mod.string())
}).passthrough();
const hitAreaSchema = mod.object({
    Id: mod.string(),
    Name: mod.string()
}).passthrough();
const modelSchema = mod.object({
    Version: mod.number(),
    FileReferences: mod.object({
        Moc: mod.string(),
        Textures: mod.array(mod.string()),
        Physics: mod.string().optional(),
        Pose: mod.string().optional(),
        Expressions: mod.array(expressionSchema).optional(),
        motions: mod.object({
        }).catchall(mod.array(motionSchema)).optional()
    }),
    Groups: mod.array(groupSchema).optional(),
    HitAreas: mod.array(hitAreaSchema).optional()
}).passthrough();
const controllerSchema = mod.object({
    Enabled: mod.boolean()
}).partial().passthrough();
const motionSchema1 = motionSchema.extend({
    Name: mod.string(),
    FileLoop: mod.boolean(),
    Text: mod.string(),
    TextDuration: mod.number(),
    MotionDuration: mod.number(),
    Priority: mod.number(),
    Interruptable: mod.boolean(),
    Command: mod.string(),
    PostCommand: mod.string(),
    TimeLimit: mod.object({
        Hour: mod.number(),
        Minute: mod.number(),
        Month: mod.number(),
        Day: mod.number(),
        Sustain: mod.number(),
        Birthday: mod.boolean()
    }).partial().passthrough(),
    Ignorable: mod.boolean(),
    Intimacy: mod.object({
        Min: mod.number(),
        Max: mod.number(),
        Bonus: mod.number()
    }).partial().passthrough(),
    NextMtn: mod.string(),
    Weight: mod.number()
}).partial().passthrough();
const modelSchema1 = modelSchema.extend({
    FileReferences: modelSchema.shape.FileReferences.extend({
        Motions: mod.object({
        }).catchall(mod.array(motionSchema1))
    }),
    Controllers: mod.object({
        MouseTracking: controllerSchema,
        LipSync: controllerSchema,
        EyeBlink: controllerSchema,
        AutoBreath: controllerSchema,
        ExtraMotion: controllerSchema,
        IntimacySystem: controllerSchema.extend({
            InitValue: mod.number(),
            MinValue: mod.number(),
            MaxValue: mod.number(),
            ActiveBonus: mod.number(),
            InactiveBonus: mod.number(),
            BonusLimit: mod.number(),
            Id: mod.string()
        }).partial().passthrough()
    }).partial().passthrough().optional(),
    Options: mod.object({
        Id: mod.string(),
        Name: mod.string(),
        ScaleFactor: mod.number(),
        AnisoLevel: mod.number()
    }).partial().optional()
}).passthrough();
const actionSchema = mod.object({
    cheek: mod.number(),
    eyeClose: mod.number(),
    face: mod.string(),
    id: mod.number().int(),
    lipSynch: mod.number(),
    live2dParam: mod.object({
        name: mod.string(),
        value: mod.number()
    }).partial(),
    motion: mod.number().int(),
    mouthOpen: mod.number(),
    soulGem: mod.number(),
    tear: mod.number(),
    textHome: mod.string(),
    textHomeStatus: mod.enum([
        "Clear"
    ]).or(mod.string()),
    voice: mod.string()
}).partial().passthrough();
const sceneSchema = mod.object({
    autoTurnFirst: mod.number(),
    autoTurnLast: mod.number(),
    chara: mod.array(actionSchema)
}).partial().passthrough();
const storySchema = mod.array(sceneSchema);
const scenarioSchema = mod.object({
    story: mod.object({
    }).catchall(storySchema),
    version: mod.number()
}).partial().passthrough();
const live2dPath = [
    "image_native",
    "live2d_v4"
];
const generalScenarioPath = [
    "scenario",
    "json",
    "general"
];
const modelFileBasename = "model";
const modelFileExtension = ".model3.json";
const paramFileName = "params.json";
async function getDirectoryHandle(handle, segments) {
    return await segments.reduce(async (handle, segment)=>await (await handle).getDirectoryHandle(segment)
    , Promise.resolve(handle));
}
async function getFileHandle(handle, [...segments], option) {
    const filename = segments.pop();
    return await getDirectoryHandle(handle, segments).then((handle)=>handle.getFileHandle(filename, option)
    );
}
function getModelDirectoryPath(charaId) {
    return [
        ...live2dPath,
        charaId
    ];
}
function getModelPath(charaId, { basename  }) {
    return [
        ...getModelDirectoryPath(charaId),
        `${basename}${modelFileExtension}`, 
    ];
}
async function* getCharaIds({ resource  }) {
    const handle = await getDirectoryHandle(resource, live2dPath);
    for await (const name of handle.keys()){
        if (/^\d{6}$/.test(name)) {
            yield name;
        }
    }
}
async function getModel(charaId, { resource , basename =modelFileBasename  }) {
    const path = getModelPath(charaId, {
        basename
    });
    const json = await getFileHandle(resource, path).then((handle)=>handle.getFile()
    ).then((file)=>file.text()
    );
    const model = JSON.parse(json);
    return modelSchema1.parse(model);
}
async function setModel(charaId, model, { resource , basename  }) {
    const path = getModelPath(charaId, {
        basename
    });
    const json = JSON.stringify(model, null, "\t");
    await getFileHandle(resource, path, {
        create: true
    }).then((handle)=>handle.createWritable()
    ).then(async (writable)=>{
        try {
            await writable.truncate(0);
            await writable.write(json);
        } finally{
            await writable.close();
        }
    });
}
async function getCharaName(charaId, { resource  }) {
    const param = await getParam(charaId, {
        resource
    }).catch((_)=>undefined
    );
    return param?.charaName;
}
async function getParam(charaId, { resource  }) {
    const path = [
        ...getModelDirectoryPath(charaId),
        paramFileName, 
    ];
    const json = await getFileHandle(resource, path).then((handle)=>handle.getFile()
    ).then((file)=>file.text()
    );
    const param = parse(json);
    return paramSchema.parse(param);
}
async function getScenario(scenarioId, { resource  }) {
    const path = [
        ...generalScenarioPath,
        `${scenarioId}.json`
    ];
    const json = await getFileHandle(resource, path).then((handle)=>handle.getFile()
    ).then((file)=>file.text()
    );
    const scenario = JSON.parse(json);
    return scenarioSchema.parse(scenario);
}
async function* getScenarioIds({ resource  }) {
    const handle = await getDirectoryHandle(resource, generalScenarioPath);
    for await (const name of handle.keys()){
        if (/^\d{6}\.json$/i.test(name)) {
            yield name.slice(0, 6);
        }
    }
}
async function validateResourceDirectory(resource) {
    const paths = [
        live2dPath,
        generalScenarioPath
    ];
    await Promise.all(paths.map(async (path)=>{
        try {
            await getDirectoryHandle(resource, path);
        } catch  {
            throw path;
        }
    }));
}
const presetMotionMeta = Symbol();
const presetMotions = [
    [
        "Start",
        {
            Name: "Intro1",
            Priority: 9,
            Intimacy: {
                Max: 0
            },
            [presetMotionMeta]: {
                storyKey: "intro_1"
            }
        }
    ],
    [
        "Start",
        {
            Name: "Intro2",
            Priority: 9,
            Intimacy: {
                Max: 8
            },
            [presetMotionMeta]: {
                storyKey: "intro_2"
            }
        }
    ],
    [
        "Start",
        {
            Name: "GreetFirst",
            Priority: 9,
            Intimacy: {
                Min: 1,
                Bonus: 4
            },
            [presetMotionMeta]: {
                storyKey: "greet_first"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "Talk1",
            Priority: 9,
            Intimacy: {
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "talk_1"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "Talk2",
            Priority: 9,
            Intimacy: {
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "talk_2"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "Talk3",
            Priority: 9,
            Intimacy: {
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "talk_3"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "Talk4",
            Priority: 9,
            Intimacy: {
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "talk_4"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "Talk5",
            Priority: 9,
            Intimacy: {
                Min: 8,
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "talk_5"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "Talk6",
            Priority: 9,
            Intimacy: {
                Min: 16,
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "talk_6"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "Talk7",
            Priority: 9,
            Intimacy: {
                Min: 24,
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "talk_7"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "Talk8",
            Priority: 9,
            Intimacy: {
                Min: 32,
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "talk_8"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "Talk9",
            Priority: 9,
            Intimacy: {
                Min: 40,
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "talk_9"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "Talk10",
            Priority: 9,
            Intimacy: {
                Min: 48,
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "talk_10"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "GreetMorning",
            Priority: 9,
            Weight: 2,
            TimeLimit: {
                Hour: 6,
                Sustain: 180
            },
            Intimacy: {
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "greet_morning"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "GreetDay",
            Priority: 9,
            Weight: 2,
            TimeLimit: {
                Hour: 11,
                Sustain: 120
            },
            Intimacy: {
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "greet_day"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "GreetEvening",
            Priority: 9,
            Weight: 2,
            TimeLimit: {
                Hour: 17,
                Sustain: 120
            },
            Intimacy: {
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "greet_evening"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "GreetNight",
            Priority: 9,
            Weight: 2,
            TimeLimit: {
                Hour: 22,
                Sustain: 120
            },
            Intimacy: {
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "greet_night"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "Greet",
            Priority: 9,
            ignorable: true,
            Intimacy: {
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "greet"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "GreetAP",
            Priority: 9,
            Intimacy: {
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "greet_ap"
            }
        }
    ],
    [
        "Tap",
        {
            Name: "GreetBP",
            Priority: 9,
            Intimacy: {
                Bonus: 1
            },
            [presetMotionMeta]: {
                storyKey: "greet_bp"
            }
        }
    ], 
];
class Resolver {
    scenarioId;
    familyId;
    constructor(scenarioId, { cast: _cast  } = {
    }){
        this.scenarioId = scenarioId;
        if (/^\d{6}$/.test(scenarioId)) {
            this.familyId = +scenarioId.replace(/.{2}$/, "00");
        }
    }
    getRoleId(...args) {
        const [actorId] = args;
        if (actorId === undefined || actorId === 0) {
            return undefined;
        }
        const { scenarioId , familyId  } = this;
        if (actorId === familyId) {
            return +scenarioId;
        }
        return actorId;
    }
    getModelId(...args) {
        const [roleId] = args;
        return `${roleId}`;
    }
    getMotionIndex(...args) {
        switch(args[0]){
            case "scene":
                {
                    const [_type, storyId, sceneIndex] = args;
                    return [
                        `Story#1`,
                        `${storyId}_${sceneIndex + 1}`
                    ];
                }
            case "motion":
                {
                    const [_type, _roleId, motion] = args;
                    return [
                        `Motion#2`,
                        `${motion}`
                    ];
                }
            case "voice":
                {
                    const [_type, _roleId, voice] = args;
                    return [
                        `Voice#3`,
                        voice
                    ];
                }
            case "voiceFull":
                {
                    const [_type, _roleId, voiceFull] = args;
                    return [
                        `VoiceFull#3`,
                        voiceFull
                    ];
                }
            case "face":
                {
                    const [_type, _roleId, face] = args;
                    const expressionId = extractExpressionId(face);
                    return [
                        `Face#4`,
                        expressionId !== undefined ? `${expressionId}` : face, 
                    ];
                }
        }
    }
    getExpressionName(...args) {
        switch(args[0]){
            case "face":
                {
                    const [_type, _roleId, face] = args;
                    return patchFace(face);
                }
        }
    }
    getFilePath(...args) {
        switch(args[0]){
            case "motion":
                {
                    const [_type, _roleId, motion] = args;
                    return `mtn/motion_${motion.toString().padStart(3, "0")}.motion3.json`;
                }
            case "face":
                {
                    const [_type, _roleId, face] = args;
                    return `exp/${patchFace(face)}`;
                }
            case "voice":
                {
                    const [_type, _roleId, voice] = args;
                    return `../../../sound_native/voice/${voice}_hca.mp3`;
                }
            case "voiceFull":
                {
                    const [_type, _roleId, voiceFull] = args;
                    return `../../../sound_native/${voiceFull}_hca.mp3`;
                }
        }
    }
}
function preprocessModel(_model) {
}
function postprocessModel(model) {
    const controllers = model.Controllers ??= {
    };
    const options = model.Options ??= {
    };
    const intimacyMaxValue = Object.values(model.FileReferences.Motions).flat().reduce((intimacyMaxValue, motion)=>motion.Intimacy?.Min ? Math.max(intimacyMaxValue ?? 0, motion.Intimacy.Min) : intimacyMaxValue
    , undefined);
    controllers.IntimacySystem = {
        Enabled: true,
        MaxValue: intimacyMaxValue
    };
    options.AnisoLevel = 2;
}
function patchCharaName(charaName) {
    return charaName.trim().replace(/_?\(?圧縮\)?|\(画面表示\)/g, "");
}
function patchScenario(scenario, scenarioId) {
    if (/^1012\d\d$/.test(scenarioId)) {
        const action = scenario.story?.group_2?.[1]?.chara?.[0];
        if (action?.id === 101201) {
            delete action.id;
        }
    }
    if (scenarioId === "350303") {
        const action = scenario.story?.group_27?.[2]?.chara?.[0];
        if (action?.id === 305303) {
            delete action.id;
        }
    }
    if (scenarioId === "402150") {
        const actions = scenario.story?.group_30?.[0]?.chara;
        if (actions?.at(-1)?.id === 0) {
            actions.pop();
        }
    }
    if (/^4045\d\d$/.test(scenarioId)) {
        const action = scenario.story?.group_3?.[1]?.chara?.[0];
        if (action?.id === 100100) {
            delete action.id;
        }
    }
}
function extractExpressionId(face) {
    const facePattern = /^mtn_ex_(?<face>\d{1,})\.exp3?\.json$/;
    const id = face.match(facePattern)?.groups.face;
    return id !== undefined ? +id : undefined;
}
function patchFace(face) {
    const expressionId = extractExpressionId(face);
    return expressionId !== undefined ? `mtn_ex_${`${expressionId}`.padStart(3, "0")}.exp3.json` : face;
}
async function* listChara1(resource, { detailed =true  } = {
}) {
    for await (const charaId of getCharaIds({
        resource
    })){
        if (detailed) {
            const name = await getCharaName(charaId, {
                resource
            }).then((name)=>name !== undefined ? patchCharaName(name) : undefined
            , ()=>undefined
            );
            yield {
                charaId,
                name
            };
        } else {
            yield {
                charaId
            };
        }
    }
}
async function* listScenario1(resource, { detailed =true  } = {
}) {
    for await (const scenarioId of getScenarioIds({
        resource
    })){
        if (detailed) {
            const name = await getCharaName(scenarioId, {
                resource
            }).then((name)=>name !== undefined ? patchCharaName(name) : undefined
            , ()=>undefined
            );
            yield {
                scenarioId,
                name
            };
        } else {
            yield {
                scenarioId
            };
        }
    }
}
function installScenario(model, scenario, roleId, resolver) {
    model.FileReferences.Motions ??= {
    };
    for (const [storyId, story] of Object.entries(scenario.story ?? {
    })){
        for (const [sceneIndex, scene] of story.entries()){
            const motionIndex = resolver.getMotionIndex("scene", storyId, sceneIndex);
            const [motionGroupName, motionName] = motionIndex;
            const nextMotion = sceneIndex + 1 < story.length ? resolver.getMotionIndex("scene", storyId, sceneIndex + 1).join(":") : undefined;
            const motionDuration = scene.autoTurnFirst !== undefined ? scene.autoTurnFirst * 1000 : scene.autoTurnLast !== undefined ? scene.autoTurnLast * 1000 : undefined;
            const actions = scene.chara ?? [];
            const command = buildCommand(roleId, actions, resolver);
            const text = buildText(roleId, actions, resolver);
            installDependencies(model, roleId, actions, resolver);
            installMotion(model, motionGroupName, {
                Name: motionName,
                MotionDuration: motionDuration,
                Command: command,
                Text: text,
                NextMtn: nextMotion
            });
        }
    }
}
function* getRoleIds(scenario, resolver) {
    const roleIds = new Set();
    for (const story of Object.values(scenario.story ?? {
    })){
        for (const scene of story){
            for (const action of scene.chara ?? []){
                const roleId = resolver.getRoleId(action.id);
                if (!roleIds.has(roleId) && roleId !== undefined) {
                    yield roleId;
                    roleIds.add(roleId);
                }
            }
        }
    }
}
function stringifyMotionIndex([motionGroupName, motionName]) {
    return motionName !== undefined ? `${motionGroupName}:${motionName}` : motionGroupName;
}
function getMotion(model, [motionGroupName, motionName]) {
    return motionName !== undefined ? model.FileReferences.Motions?.[motionGroupName]?.find((motion)=>motion.Name === motionName
    ) : undefined;
}
function isMotionInstalled(model, [motionGroupName, motionName]) {
    return motionName !== undefined && !!model.FileReferences.Motions?.[motionGroupName]?.some((motion)=>motion.Name === motionName
    );
}
function isExpressionInstalled(model, expressionName) {
    return !!model.FileReferences.Expressions?.some((expression)=>expression.Name === expressionName
    );
}
function installMotion(model, motionGroupName, motion) {
    const motionGroup = (model.FileReferences.Motions ??= {
    })[motionGroupName] ??= [];
    const motionName = motion.Name;
    if (motionName === undefined) {
        motionGroup.push(motion);
    } else {
        const index = motionGroup.findIndex((motion)=>motion.Name === motionName
        );
        if (index >= 0) {
            motionGroup.splice(index, 1, motion);
        } else {
            motionGroup.push(motion);
        }
    }
}
function installExpression(model, expression) {
    const expressions = model.FileReferences.Expressions ??= [];
    const expressionName = expression.Name;
    const index = expressions.findIndex((expression)=>expression.Name !== expressionName
    );
    if (index >= 0) {
        expressions.splice(index, 1, expression);
    } else {
        expressions.push(expression);
    }
}
function installParam(model, param) {
    const options = model.Options ??= {
    };
    options.Name = param.charaName;
    options.ScaleFactor = param.modelScale;
}
function buildStoryEntryCommand(roleId, roleIds, motionIndex, resolver) {
    const motionRef = stringifyMotionIndex(motionIndex);
    const commands = [
        `start_mtn ${motionRef}`
    ];
    for (const rid of roleIds){
        if (rid === roleId || rid === undefined) {
            continue;
        }
        commands.push(`start_mtn ${resolver.getModelId(rid)} ${motionRef}`);
    }
    return commands.join(";");
}
function installDependencies(model, roleId, actions, resolver) {
    for (const action of actions){
        if (resolver.getRoleId(action.id) !== roleId) {
            continue;
        }
        const { motion , face , voice  } = action;
        if (motion !== undefined) {
            const motionIndex = resolver.getMotionIndex("motion", roleId, motion);
            if (!isMotionInstalled(model, motionIndex)) {
                const [motionGroupName, motionName] = motionIndex;
                const filePath = resolver.getFilePath("motion", roleId, motion);
                if (motion < 100) {
                    installMotion(model, motionGroupName, {
                        Name: motionName,
                        File: filePath,
                        FileLoop: true,
                        Command: "eye_blink enforce",
                        FadeOut: 0
                    });
                } else {
                    installMotion(model, motionGroupName, {
                        Name: motionName,
                        Command: "eye_blink enforce",
                        File: filePath
                    });
                }
            }
        }
        if (face !== undefined) {
            const motionIndex = resolver.getMotionIndex("face", roleId, face);
            const expressionName = resolver.getExpressionName("face", roleId, face);
            if (!isMotionInstalled(model, motionIndex)) {
                const [motionGroupName, motionName] = motionIndex;
                installMotion(model, motionGroupName, {
                    Name: motionName,
                    Expression: expressionName
                });
            }
            if (!isExpressionInstalled(model, expressionName)) {
                const filePath = resolver.getFilePath("face", roleId, face);
                installExpression(model, {
                    Name: expressionName,
                    File: filePath
                });
            }
        }
        if (voice !== undefined) {
            const motionIndex = resolver.getMotionIndex("voice", roleId, voice);
            if (!isMotionInstalled(model, motionIndex)) {
                const [motionGroupName, motionName] = motionIndex;
                const filePath = resolver.getFilePath("voice", roleId, voice);
                installMotion(model, motionGroupName, {
                    Name: motionName,
                    Sound: filePath
                });
            }
        }
    }
}
function buildCommand(roleId, actions, resolver) {
    const commands = [
        "parameters unlock"
    ];
    for (const action of actions){
        if (resolver.getRoleId(action.id) !== roleId) {
            continue;
        }
        const { motion , face , voice , lipSynch , cheek , eyeClose , mouthOpen , soulGem , tear , live2dParam , textHomeStatus ,  } = action;
        if (motion !== undefined) {
            const motionIndex = resolver.getMotionIndex("motion", roleId, motion);
            commands.push(`start_mtn ${stringifyMotionIndex(motionIndex)}`);
        }
        if (face !== undefined) {
            const motionIndex = resolver.getMotionIndex("face", roleId, face);
            commands.push(`start_mtn ${stringifyMotionIndex(motionIndex)}`);
        }
        if (voice !== undefined) {
            const motionIndex = resolver.getMotionIndex("voice", roleId, voice);
            commands.push(`start_mtn ${stringifyMotionIndex(motionIndex)}`);
        }
        if (lipSynch !== undefined) {
            if (lipSynch) {
                commands.push(`unmute_sound 0`, `lip_sync enable`);
            } else {
                if (actions.some((action)=>action.lipSynch
                )) {
                    commands.push(`mute_sound 0`);
                } else {
                    commands.push(`lip_sync disable`, `parameters lock ParamMouthOpenY 0`);
                }
            }
        }
        if (cheek !== undefined) {
            commands.push(`parameters lock ParamCheek ${cheek}`);
        }
        if (eyeClose !== undefined) {
            commands.push(`parameters lock ParamEyeLOpen ${1 - eyeClose}`, `parameters lock ParamEyeROpen ${1 - eyeClose}`);
        }
        if (mouthOpen !== undefined) {
            commands.push(`parameters lock ParamMouthOpenY ${mouthOpen}`);
        }
        if (soulGem !== undefined) {
            commands.push(`parameters lock ParamSoulgem ${soulGem}`);
        }
        if (tear !== undefined) {
            commands.push(`parameters lock ParamTear ${tear}`);
        }
        if (live2dParam?.name !== undefined && live2dParam?.value !== undefined) {
            const name = live2dParam.name.replace(/_?([A-Za-z]+)/g, (_, $1)=>`${$1[0].toUpperCase()}${$1.slice(1).toLowerCase()}`
            );
            commands.push(`parameters lock ${name} ${live2dParam.value}`);
        }
        if (textHomeStatus === "Clear") {
            commands.push(`hide_text`);
        }
    }
    return commands.join(";") || undefined;
}
function buildText(roleId, actions, resolver) {
    const texts = [];
    for (const action of actions){
        if (resolver.getRoleId(action.id) !== roleId) {
            continue;
        }
        const { textHome  } = action;
        if (textHome !== undefined) {
            const text = textHome.replace(/\[.*?\]/g, "").replace(/@/g, "\n");
            texts.push(text);
        }
    }
    return texts.join("{$br}") || undefined;
}
async function* listRole1(resource, scenarioId, { detailed =true  } = {
}) {
    let scenario;
    try {
        scenario = await getScenario(+scenarioId, {
            resource
        });
    } catch (error) {
        throw new Error("scenario not found", {
            cause: error
        });
    }
    patchScenario(scenario, scenarioId);
    const resolver = new Resolver(scenarioId);
    const roleIds = [
        ...getRoleIds(scenario, resolver)
    ].sort((a, b)=>a === undefined ? 1 : b === undefined ? -1 : a - b
    );
    for (const roleId of roleIds){
        if (detailed) {
            const name = await getCharaName(`${roleId}`, {
                resource
            }).then((name)=>name !== undefined ? patchCharaName(name) : undefined
            , ()=>undefined
            );
            yield {
                roleId,
                name
            };
        } else {
            yield {
                roleId
            };
        }
    }
}
function deferred() {
    let methods;
    let state = "pending";
    const promise = new Promise((resolve, reject)=>{
        methods = {
            async resolve (value) {
                await value;
                state = "fulfilled";
                resolve(value);
            },
            reject (reason) {
                state = "rejected";
                reject(reason);
            }
        };
    });
    Object.defineProperty(promise, "state", {
        get: ()=>state
    });
    return Object.assign(promise, methods);
}
class MuxAsyncIterator {
    iteratorCount = 0;
    yields = [];
    throws = [];
    signal = deferred();
    add(iterable) {
        ++this.iteratorCount;
        this.callIteratorNext(iterable[Symbol.asyncIterator]());
    }
    async callIteratorNext(iterator) {
        try {
            const { value , done  } = await iterator.next();
            if (done) {
                --this.iteratorCount;
            } else {
                this.yields.push({
                    iterator,
                    value
                });
            }
        } catch (e) {
            this.throws.push(e);
        }
        this.signal.resolve();
    }
    async *iterate() {
        while(this.iteratorCount > 0){
            await this.signal;
            for(let i = 0; i < this.yields.length; i++){
                const { iterator , value  } = this.yields[i];
                yield value;
                this.callIteratorNext(iterator);
            }
            if (this.throws.length) {
                for (const e of this.throws){
                    throw e;
                }
                this.throws.length = 0;
            }
            this.yields.length = 0;
            this.signal = deferred();
        }
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
}
const stories = {
    intro_1: {
        name: "自己紹介①"
    },
    intro_2: {
        name: "自己紹介②"
    },
    episode_1: {
        name: "魔法少女ストーリー①"
    },
    episode_2: {
        name: "魔法少女ストーリー②"
    },
    episode_3: {
        name: "魔法少女ストーリー③"
    },
    grow: {
        name: "強化完了"
    },
    grow_max: {
        name: "強化(Lv最大時)"
    },
    grow_episode: {
        name: "エピソードLvアップ"
    },
    grow_release_1: {
        name: "魔力解放①"
    },
    grow_release_2: {
        name: "魔力解放②"
    },
    grow_release_3: {
        name: "魔力解放③"
    },
    grow_magia: {
        name: "マギアLvアップ"
    },
    grow_awake_1: {
        name: "魔法少女覚醒①"
    },
    grow_awake_2: {
        name: "魔法少女覚醒②"
    },
    grow_awake_3: {
        name: "魔法少女覚醒③"
    },
    grow_awake_4: {
        name: "魔法少女覚醒④"
    },
    greet_first: {
        name: "ログイン①(初回ログイン時)"
    },
    greet_morning: {
        name: "ログイン②(朝)"
    },
    greet_day: {
        name: "ログイン③(昼)"
    },
    greet_evening: {
        name: "ログイン④(夜)"
    },
    greet_night: {
        name: "ログイン⑤(深夜)"
    },
    greet: {
        name: "ログイン⑥(その他)"
    },
    greet_ap: {
        name: "ログイン⑦(AP最大時)"
    },
    greet_bp: {
        name: "ログイン⑧(BP最大時)"
    },
    talk_1: {
        name: "魔法少女タップ①"
    },
    talk_2: {
        name: "魔法少女タップ②"
    },
    talk_3: {
        name: "魔法少女タップ③"
    },
    talk_4: {
        name: "魔法少女タップ④"
    },
    talk_5: {
        name: "魔法少女タップ⑤"
    },
    talk_6: {
        name: "魔法少女タップ⑥"
    },
    talk_7: {
        name: "魔法少女タップ⑦"
    },
    talk_8: {
        name: "魔法少女タップ⑧"
    },
    talk_9: {
        name: "魔法少女タップ⑨"
    },
    talk_10: {
        name: "魔法少女タップ⑩"
    },
    battle_start: {
        name: "クエスト開始"
    },
    battle_win_1: {
        name: "クエスト勝利①"
    },
    battle_win_2: {
        name: "クエスト勝利②"
    },
    battle_win_3: {
        name: "クエスト勝利③"
    },
    battle_win_4: {
        name: "クエスト勝利③"
    },
    magia_1: {
        name: "マギア①"
    },
    magia_2: {
        name: "マギア②"
    },
    magia_3: {
        name: "マギア③"
    },
    magia_4: {
        name: "マギア④"
    }
};
[
    {
        title: "魔法少女",
        stories: [
            stories.intro_1,
            stories.intro_2,
            stories.episode_1,
            stories.episode_2,
            stories.episode_3, 
        ]
    },
    {
        title: "育成",
        stories: [
            stories.grow,
            stories.grow_max,
            stories.grow_episode,
            stories.grow_release_1,
            stories.grow_release_2,
            stories.grow_release_3,
            stories.grow_magia,
            stories.grow_awake_1,
            stories.grow_awake_2,
            stories.grow_awake_3, 
        ]
    },
    {
        title: "ホーム",
        stories: [
            stories.greet_first,
            stories.greet_morning,
            stories.greet_day,
            stories.greet_evening,
            stories.greet_night,
            stories.greet,
            stories.greet_ap,
            stories.greet_bp,
            stories.talk_1,
            stories.talk_2,
            stories.talk_3,
            stories.talk_4,
            stories.talk_5,
            stories.talk_6,
            stories.talk_7,
            stories.talk_8,
            stories.talk_9, 
        ]
    },
    {
        title: "クエスト",
        stories: [
            stories.battle_start,
            stories.battle_win_1,
            stories.battle_win_2,
            stories.battle_win_3, 
        ]
    }, 
];
const spoilerStoryKeys = [
    "talk_10"
];
function getStoryId(_scenarioId, scenario, storyKey) {
    const intro2Index = [
        39,
        43
    ].find((index)=>scenario.story?.[`group_${index}`]?.[0]?.chara?.[0].voice?.endsWith("_02")
    ) ?? 2;
    let index;
    if (storyKey === "intro_2") {
        index = intro2Index;
    } else {
        const patternIndex = storyMap[storyKey];
        if (patternIndex !== undefined) {
            index = patternIndex >= 2 && patternIndex <= intro2Index ? patternIndex - 1 : patternIndex;
        }
    }
    return index !== undefined ? `group_${index}` : undefined;
}
const storyMap = {
    intro_1: 1,
    intro_2: 2,
    episode_1: 3,
    episode_2: 4,
    episode_3: 5,
    grow: 6,
    grow_max: 7,
    grow_episode: 8,
    grow_release_1: 9,
    grow_release_2: 10,
    grow_release_3: 11,
    grow_magia: 12,
    grow_awake_1: 13,
    grow_awake_2: 14,
    grow_awake_3: 15,
    grow_awake_4: 16,
    greet_first: 17,
    greet_morning: 18,
    greet_day: 19,
    greet_evening: 20,
    greet_night: 21,
    greet: 22,
    greet_ap: 23,
    greet_bp: 24,
    talk_10: 25,
    talk_1: 26,
    talk_2: 27,
    talk_3: 28,
    talk_4: 29,
    talk_5: 30,
    talk_6: 31,
    talk_7: 32,
    talk_8: 33,
    talk_9: 34,
    battle_start: 35,
    battle_win_1: 36,
    battle_win_2: 37,
    battle_win_3: 38,
    battle_win_4: 39,
    magia_1: 40,
    magia_2: 41,
    magia_3: 42,
    magia_4: 43
};
async function* bakeExModel1(resource, target, { allowSpoiler , cast: baseCast  } = {
}) {
    try {
        const familyId = target.replace(/.{2}$/, "00");
        let scenarioId, scenario;
        try {
            [scenarioId, scenario] = await getScenario(+target, {
                resource
            }).then((scenario)=>[
                    target,
                    scenario
                ]
            , (_)=>getScenario(+familyId, {
                    resource
                }).then((scenario)=>[
                        familyId,
                        scenario
                    ]
                )
            );
        } catch (error) {
            yield {
                type: "skip",
                reason: "SCENARIO_NOT_FOUND",
                target,
                error
            };
            return;
        }
        patchScenario(scenario, scenarioId);
        const cast = baseCast?.has(+familyId) ? baseCast : new Map(baseCast ?? []).set(+familyId, baseCast?.get(+target) ?? +target);
        const filteredPresetMotions = presetMotions.filter(([_, motion])=>allowSpoiler || !spoilerStoryKeys.includes(motion[presetMotionMeta].storyKey)
        );
        const motionEntries = filteredPresetMotions.map(([motionGroupName, motion])=>[
                [
                    motionGroupName,
                    motion.Name
                ],
                motion[presetMotionMeta].storyKey, 
            ]
        );
        const storyIds = filteredPresetMotions.map(([_, motion])=>motion[presetMotionMeta].storyKey
        ).map((storyKey)=>getStoryId(scenarioId, scenario, storyKey)
        ).filter((storyId)=>storyId !== undefined
        );
        const filteredScenario = {
            ...scenario,
            story: Object.fromEntries(Object.entries(scenario.story ?? {
            }).filter(([storyId, _story])=>storyIds.includes(storyId)
            ))
        };
        const resolver = new Resolver(scenarioId, {
            cast: (roleId)=>`${cast.get(roleId) ?? roleId}`
        });
        const roleIds = [
            ...getRoleIds(filteredScenario, resolver)
        ].filter((roleId)=>roleId !== undefined && roleId > 0
        );
        const iters = roleIds.map(async function*(roleId) {
            try {
                const charaId = `${cast.get(roleId) ?? roleId}`;
                const [model, param] = await Promise.all([
                    getModel(charaId, {
                        resource
                    }).catch((_)=>undefined
                    ),
                    getParam(charaId, {
                        resource
                    }).catch((_)=>undefined
                    ), 
                ]);
                if (model === undefined) {
                    yield {
                        type: "skip",
                        reason: "MODEL_NOT_FOUND",
                        target,
                        charaId,
                        roleId
                    };
                    return;
                }
                preprocessModel(model);
                for (const [motionGroupName, motion] of filteredPresetMotions){
                    installMotion(model, motionGroupName, {
                        ...motion
                    });
                }
                for (const [motionIndex, storyKey] of motionEntries){
                    const motion = getMotion(model, motionIndex);
                    const storyId = getStoryId(scenarioId, scenario, storyKey);
                    const storyMotionIndex = resolver.getMotionIndex("scene", storyId, 0);
                    motion.Command = buildStoryEntryCommand(roleId, roleIds, storyMotionIndex, resolver);
                }
                installScenario(model, filteredScenario, roleId, resolver);
                if (param !== undefined) {
                    installParam(model, {
                        ...param,
                        charaName: patchCharaName(param.charaName)
                    });
                }
                (model.Options ??= {
                }).Id = resolver.getModelId(roleId);
                postprocessModel(model);
                const basename = roleIds.length > 1 ? `model-${scenarioId}@${roleId}` : `model-${scenarioId}`;
                await setModel(charaId, model, {
                    resource,
                    basename
                });
                const path = getModelPath(charaId, {
                    basename
                });
                yield {
                    type: "success",
                    path,
                    target,
                    charaId,
                    roleId
                };
            } catch (error) {
                yield {
                    type: "fail",
                    error
                };
            }
        });
        const mux = new MuxAsyncIterator();
        for (const iter of iters){
            mux.add(iter);
        }
        yield* mux;
    } catch (error1) {
        yield {
            type: "fail",
            error: error1
        };
    }
}
async function validateResource1(resource) {
    await validateResourceDirectory(resource);
}
export { listChara1 as listChara };
export { listScenario1 as listScenario };
export { listRole1 as listRole };
export { bakeExModel1 as bakeExModel };
export { validateResource1 as validateResource };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGpzb25fZGVub0B2MS4wLjEvbGliL2hqc29uLWNvbW1vbi5qcyIsImh0dHBzOi8vZGVuby5sYW5kL3gvaGpzb25fZGVub0B2MS4wLjEvbGliL2hqc29uLXZlcnNpb24uanMiLCJodHRwczovL2Rlbm8ubGFuZC94L2hqc29uX2Rlbm9AdjEuMC4xL2xpYi9oanNvbi1kc2YuanMiLCJodHRwczovL2Rlbm8ubGFuZC94L2hqc29uX2Rlbm9AdjEuMC4xL2xpYi9oanNvbi1wYXJzZS5qcyIsImh0dHBzOi8vZGVuby5sYW5kL3gvaGpzb25fZGVub0B2MS4wLjEvbGliL2hqc29uLXN0cmluZ2lmeS5qcyIsImh0dHBzOi8vZGVuby5sYW5kL3gvaGpzb25fZGVub0B2MS4wLjEvbGliL2hqc29uLWNvbW1lbnRzLmpzIiwiaHR0cHM6Ly9kZW5vLmxhbmQveC9oanNvbl9kZW5vQHYxLjAuMS9saWIvaGpzb24uanMiLCJodHRwczovL2Rlbm8ubGFuZC94L2hqc29uX2Rlbm9AdjEuMC4xL21vZC50cyIsImh0dHBzOi8vZGVuby5sYW5kL3gvem9kQHYzLjkuMC9oZWxwZXJzL3V0aWwudHMiLCJodHRwczovL2Rlbm8ubGFuZC94L3pvZEB2My45LjAvWm9kRXJyb3IudHMiLCJodHRwczovL2Rlbm8ubGFuZC94L3pvZEB2My45LjAvaGVscGVycy9wYXJzZVV0aWwudHMiLCJodHRwczovL2Rlbm8ubGFuZC94L3pvZEB2My45LjAvaGVscGVycy9lcnJvclV0aWwudHMiLCJodHRwczovL2Rlbm8ubGFuZC94L3pvZEB2My45LjAvdHlwZXMudHMiLCJmaWxlOi8vL2hvbWUvcmVvL1Byb2plY3RzL21ncmNkLWxpdmUyZC96b2Qtc2NoZW1hcy9tYWdpcmVjby9tb2RlbC1wYXJhbXMudHMiLCJmaWxlOi8vL2hvbWUvcmVvL1Byb2plY3RzL21ncmNkLWxpdmUyZC96b2Qtc2NoZW1hcy9MaXZlMkQvbW9kZWwubW9kZWwzLnRzIiwiZmlsZTovLy9ob21lL3Jlby9Qcm9qZWN0cy9tZ3JjZC1saXZlMmQvem9kLXNjaGVtYXMvTGl2ZTJEVmlld2VyRVgvbW9kZWwubW9kZWwzLnRzIiwiZmlsZTovLy9ob21lL3Jlby9Qcm9qZWN0cy9tZ3JjZC1saXZlMmQvem9kLXNjaGVtYXMvbWFnaXJlY28vc2NlbmFyaW8udHMiLCJmaWxlOi8vL2hvbWUvcmVvL1Byb2plY3RzL21ncmNkLWxpdmUyZC9saWIvX2ludGVybmFsL2lvLnRzIiwiZmlsZTovLy9ob21lL3Jlby9Qcm9qZWN0cy9tZ3JjZC1saXZlMmQvbGliL19pbnRlcm5hbC9jb25maWcudHMiLCJmaWxlOi8vL2hvbWUvcmVvL1Byb2plY3RzL21ncmNkLWxpdmUyZC9saWIvbGlzdC1jaGFyYS50cyIsImZpbGU6Ly8vaG9tZS9yZW8vUHJvamVjdHMvbWdyY2QtbGl2ZTJkL2xpYi9saXN0LXNjZW5hcmlvLnRzIiwiZmlsZTovLy9ob21lL3Jlby9Qcm9qZWN0cy9tZ3JjZC1saXZlMmQvbGliL19pbnRlcm5hbC9pbnN0YWxsLnRzIiwiZmlsZTovLy9ob21lL3Jlby9Qcm9qZWN0cy9tZ3JjZC1saXZlMmQvbGliL2xpc3Qtcm9sZS50cyIsImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjExMy4wL2FzeW5jL2RlZmVycmVkLnRzIiwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQDAuMTEzLjAvYXN5bmMvbXV4X2FzeW5jX2l0ZXJhdG9yLnRzIiwiZmlsZTovLy9ob21lL3Jlby9Qcm9qZWN0cy9tZ3JjZC1saXZlMmQvZGF0YS9tYWdpcmVjby9nZW5lcmFsLXNjZW5hcmlvLnRzIiwiZmlsZTovLy9ob21lL3Jlby9Qcm9qZWN0cy9tZ3JjZC1saXZlMmQvbGliL2Jha2UtZXgtbW9kZWwudHMiLCJmaWxlOi8vL2hvbWUvcmVvL1Byb2plY3RzL21ncmNkLWxpdmUyZC9saWIvdmFsaWRhdGUtcmVzb3VyY2UudHMiLCJmaWxlOi8vL2hvbWUvcmVvL1Byb2plY3RzL21ncmNkLWxpdmUyZC9tb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFB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