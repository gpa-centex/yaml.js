(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Dumper, Inline, Utils;

Utils = require('./Utils');

Inline = require('./Inline');

Dumper = (function() {
  function Dumper() {}

  Dumper.indentation = 4;

  Dumper.prototype.dump = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    var i, key, len, output, prefix, value, willBeInlined;
    if (inline == null) {
      inline = 0;
    }
    if (indent == null) {
      indent = 0;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    output = '';
    prefix = (indent ? Utils.strRepeat(' ', indent) : '');
    if (inline <= 0 || typeof input !== 'object' || input instanceof Date || Utils.isEmpty(input)) {
      output += prefix + Inline.dump(input, exceptionOnInvalidType, objectEncoder);
    } else {
      if (input instanceof Array) {
        for (i = 0, len = input.length; i < len; i++) {
          value = input[i];
          willBeInlined = inline - 1 <= 0 || typeof value !== 'object' || Utils.isEmpty(value);
          output += prefix + '-' + (willBeInlined ? ' ' : "\n") + this.dump(value, inline - 1, (willBeInlined ? 0 : indent + this.indentation), exceptionOnInvalidType, objectEncoder) + (willBeInlined ? "\n" : '');
        }
      } else {
        for (key in input) {
          value = input[key];
          willBeInlined = inline - 1 <= 0 || typeof value !== 'object' || Utils.isEmpty(value);
          output += prefix + Inline.dump(key, exceptionOnInvalidType, objectEncoder) + ':' + (willBeInlined ? ' ' : "\n") + this.dump(value, inline - 1, (willBeInlined ? 0 : indent + this.indentation), exceptionOnInvalidType, objectEncoder) + (willBeInlined ? "\n" : '');
        }
      }
    }
    return output;
  };

  return Dumper;

})();

module.exports = Dumper;


},{"./Inline":6,"./Utils":10}],2:[function(require,module,exports){
var Escaper, Pattern;

Pattern = require('./Pattern');

Escaper = (function() {
  var ch;

  function Escaper() {}

  Escaper.LIST_ESCAPEES = ['\\', '\\\\', '\\"', '"', "\x00", "\x01", "\x02", "\x03", "\x04", "\x05", "\x06", "\x07", "\x08", "\x09", "\x0a", "\x0b", "\x0c", "\x0d", "\x0e", "\x0f", "\x10", "\x11", "\x12", "\x13", "\x14", "\x15", "\x16", "\x17", "\x18", "\x19", "\x1a", "\x1b", "\x1c", "\x1d", "\x1e", "\x1f", (ch = String.fromCharCode)(0x0085), ch(0x00A0), ch(0x2028), ch(0x2029)];

  Escaper.LIST_ESCAPED = ['\\\\', '\\"', '\\"', '\\"', "\\0", "\\x01", "\\x02", "\\x03", "\\x04", "\\x05", "\\x06", "\\a", "\\b", "\\t", "\\n", "\\v", "\\f", "\\r", "\\x0e", "\\x0f", "\\x10", "\\x11", "\\x12", "\\x13", "\\x14", "\\x15", "\\x16", "\\x17", "\\x18", "\\x19", "\\x1a", "\\e", "\\x1c", "\\x1d", "\\x1e", "\\x1f", "\\N", "\\_", "\\L", "\\P"];

  Escaper.MAPPING_ESCAPEES_TO_ESCAPED = (function() {
    var i, j, mapping, ref;
    mapping = {};
    for (i = j = 0, ref = Escaper.LIST_ESCAPEES.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      mapping[Escaper.LIST_ESCAPEES[i]] = Escaper.LIST_ESCAPED[i];
    }
    return mapping;
  })();

  Escaper.PATTERN_CHARACTERS_TO_ESCAPE = new Pattern('[\\x00-\\x1f]|\xc2\x85|\xc2\xa0|\xe2\x80\xa8|\xe2\x80\xa9');

  Escaper.PATTERN_MAPPING_ESCAPEES = new Pattern(Escaper.LIST_ESCAPEES.join('|').split('\\').join('\\\\'));

  Escaper.PATTERN_SINGLE_QUOTING = new Pattern('[\'":{}[\\],*#?]|^[-?|<>=!%@`]');

  Escaper.requiresDoubleQuoting = function(value) {
    return this.PATTERN_CHARACTERS_TO_ESCAPE.test(value);
  };

  Escaper.escapeWithDoubleQuotes = function(value) {
    var result;
    result = this.PATTERN_MAPPING_ESCAPEES.replace(value, (function(_this) {
      return function(str) {
        return _this.MAPPING_ESCAPEES_TO_ESCAPED[str];
      };
    })(this));
    return '"' + result + '"';
  };

  Escaper.requiresSingleQuoting = function(value) {
    return this.PATTERN_SINGLE_QUOTING.test(value);
  };

  Escaper.escapeWithSingleQuotes = function(value) {
    return "'" + value.replace(/'/g, "''") + "'";
  };

  return Escaper;

})();

module.exports = Escaper;


},{"./Pattern":8}],3:[function(require,module,exports){
var DumpException,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DumpException = (function(superClass) {
  extend(DumpException, superClass);

  function DumpException(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  DumpException.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<DumpException> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<DumpException> ' + this.message;
    }
  };

  return DumpException;

})(Error);

module.exports = DumpException;


},{}],4:[function(require,module,exports){
var ParseException,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ParseException = (function(superClass) {
  extend(ParseException, superClass);

  function ParseException(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  ParseException.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<ParseException> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<ParseException> ' + this.message;
    }
  };

  return ParseException;

})(Error);

module.exports = ParseException;


},{}],5:[function(require,module,exports){
var ParseMore,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ParseMore = (function(superClass) {
  extend(ParseMore, superClass);

  function ParseMore(message, parsedLine, snippet) {
    this.message = message;
    this.parsedLine = parsedLine;
    this.snippet = snippet;
  }

  ParseMore.prototype.toString = function() {
    if ((this.parsedLine != null) && (this.snippet != null)) {
      return '<ParseMore> ' + this.message + ' (line ' + this.parsedLine + ': \'' + this.snippet + '\')';
    } else {
      return '<ParseMore> ' + this.message;
    }
  };

  return ParseMore;

})(Error);

module.exports = ParseMore;


},{}],6:[function(require,module,exports){
var DumpException, Escaper, Inline, ParseException, ParseMore, Pattern, Unescaper, Utils,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Pattern = require('./Pattern');

Unescaper = require('./Unescaper');

Escaper = require('./Escaper');

Utils = require('./Utils');

ParseException = require('./Exception/ParseException');

ParseMore = require('./Exception/ParseMore');

DumpException = require('./Exception/DumpException');

Inline = (function() {
  function Inline() {}

  Inline.REGEX_QUOTED_STRING = '(?:"(?:[^"\\\\]*(?:\\\\.[^"\\\\]*)*)"|\'(?:[^\']*(?:\'\'[^\']*)*)\')';

  Inline.PATTERN_TRAILING_COMMENTS = new Pattern('^\\s*#.*$');

  Inline.PATTERN_QUOTED_SCALAR = new Pattern('^' + Inline.REGEX_QUOTED_STRING);

  Inline.PATTERN_THOUSAND_NUMERIC_SCALAR = new Pattern('^(-|\\+)?[0-9,]+(\\.[0-9]+)?$');

  Inline.PATTERN_SCALAR_BY_DELIMITERS = {};

  Inline.settings = {};

  Inline.configure = function(exceptionOnInvalidType, objectDecoder) {
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = null;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.settings.exceptionOnInvalidType = exceptionOnInvalidType;
    this.settings.objectDecoder = objectDecoder;
  };

  Inline.parse = function(value, exceptionOnInvalidType, objectDecoder) {
    var context, result;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.settings.exceptionOnInvalidType = exceptionOnInvalidType;
    this.settings.objectDecoder = objectDecoder;
    if (value == null) {
      return '';
    }
    value = Utils.trim(value);
    if (0 === value.length) {
      return '';
    }
    context = {
      exceptionOnInvalidType: exceptionOnInvalidType,
      objectDecoder: objectDecoder,
      i: 0
    };
    switch (value.charAt(0)) {
      case '[':
        result = this.parseSequence(value, context);
        ++context.i;
        break;
      case '{':
        result = this.parseMapping(value, context);
        ++context.i;
        break;
      default:
        result = this.parseScalar(value, null, ['"', "'"], context);
    }
    if (this.PATTERN_TRAILING_COMMENTS.replace(value.slice(context.i), '') !== '') {
      throw new ParseException('Unexpected characters near "' + value.slice(context.i) + '".');
    }
    return result;
  };

  Inline.dump = function(value, exceptionOnInvalidType, objectEncoder) {
    var ref, result, type;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    if (value == null) {
      return 'null';
    }
    type = typeof value;
    if (type === 'object') {
      if (objectEncoder != null) {
        result = objectEncoder(value);
        if (typeof result === 'string' || (result != null)) {
          return result;
        }
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return this.dumpObject(value);
    }
    if (type === 'boolean') {
      return (value ? 'yes' : 'no');
    }
    if (Utils.isDigits(value)) {
      return (type === 'string' ? "'" + value + "'" : String(parseInt(value)));
    }
    if (Utils.isNumeric(value)) {
      return (type === 'string' ? "'" + value + "'" : String(parseFloat(value)));
    }
    if (type === 'number') {
      return (value === 2e308 ? '.Inf' : (value === -2e308 ? '-.Inf' : (isNaN(value) ? '.NaN' : value)));
    }
    if (Escaper.requiresDoubleQuoting(value)) {
      return Escaper.escapeWithDoubleQuotes(value);
    }
    if (Escaper.requiresSingleQuoting(value)) {
      return Escaper.escapeWithSingleQuotes(value);
    }
    if ('' === value) {
      return '""';
    }
    if (Utils.PATTERN_DATE.test(value)) {
      return "'" + value + "'";
    }
    if ((ref = value.toLowerCase()) === 'null' || ref === '~' || ref === 'true' || ref === 'false') {
      return "'" + value + "'";
    }
    return value;
  };

  Inline.dumpObject = function(value, exceptionOnInvalidType, objectSupport) {
    var j, key, len1, output, val;
    if (objectSupport == null) {
      objectSupport = null;
    }
    if (value instanceof Array) {
      output = [];
      for (j = 0, len1 = value.length; j < len1; j++) {
        val = value[j];
        output.push(this.dump(val));
      }
      return '[' + output.join(', ') + ']';
    } else {
      output = [];
      for (key in value) {
        val = value[key];
        output.push(this.dump(key) + ': ' + this.dump(val));
      }
      return '{' + output.join(', ') + '}';
    }
  };

  Inline.parseScalar = function(scalar, delimiters, stringDelimiters, context, evaluate) {
    var i, joinedDelimiters, match, output, pattern, ref, ref1, strpos, tmp;
    if (delimiters == null) {
      delimiters = null;
    }
    if (stringDelimiters == null) {
      stringDelimiters = ['"', "'"];
    }
    if (context == null) {
      context = null;
    }
    if (evaluate == null) {
      evaluate = true;
    }
    if (context == null) {
      context = {
        exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
        objectDecoder: this.settings.objectDecoder,
        i: 0
      };
    }
    i = context.i;
    if (ref = scalar.charAt(i), indexOf.call(stringDelimiters, ref) >= 0) {
      output = this.parseQuotedScalar(scalar, context);
      i = context.i;
      if (delimiters != null) {
        tmp = Utils.ltrim(scalar.slice(i), ' ');
        if (!(ref1 = tmp.charAt(0), indexOf.call(delimiters, ref1) >= 0)) {
          throw new ParseException('Unexpected characters (' + scalar.slice(i) + ').');
        }
      }
    } else {
      if (!delimiters) {
        output = scalar.slice(i);
        i += output.length;
        strpos = output.indexOf(' #');
        if (strpos !== -1) {
          output = Utils.rtrim(output.slice(0, strpos));
        }
      } else {
        joinedDelimiters = delimiters.join('|');
        pattern = this.PATTERN_SCALAR_BY_DELIMITERS[joinedDelimiters];
        if (pattern == null) {
          pattern = new Pattern('^(.+?)(' + joinedDelimiters + ')');
          this.PATTERN_SCALAR_BY_DELIMITERS[joinedDelimiters] = pattern;
        }
        if (match = pattern.exec(scalar.slice(i))) {
          output = match[1];
          i += output.length;
        } else {
          throw new ParseException('Malformed inline YAML string (' + scalar + ').');
        }
      }
      if (evaluate) {
        output = this.evaluateScalar(output, context);
      }
    }
    context.i = i;
    return output;
  };

  Inline.parseQuotedScalar = function(scalar, context) {
    var i, match, output;
    i = context.i;
    if (!(match = this.PATTERN_QUOTED_SCALAR.exec(scalar.slice(i)))) {
      throw new ParseMore('Malformed inline YAML string (' + scalar.slice(i) + ').');
    }
    output = match[0].substr(1, match[0].length - 2);
    if ('"' === scalar.charAt(i)) {
      output = Unescaper.unescapeDoubleQuotedString(output);
    } else {
      output = Unescaper.unescapeSingleQuotedString(output);
    }
    i += match[0].length;
    context.i = i;
    return output;
  };

  Inline.parseSequence = function(sequence, context) {
    var e, i, isQuoted, len, output, ref, value;
    output = [];
    len = sequence.length;
    i = context.i;
    i += 1;
    while (i < len) {
      context.i = i;
      switch (sequence.charAt(i)) {
        case '[':
          output.push(this.parseSequence(sequence, context));
          i = context.i;
          break;
        case '{':
          output.push(this.parseMapping(sequence, context));
          i = context.i;
          break;
        case ']':
          return output;
        case ',':
        case ' ':
        case "\n":
          break;
        default:
          isQuoted = ((ref = sequence.charAt(i)) === '"' || ref === "'");
          value = this.parseScalar(sequence, [',', ']'], ['"', "'"], context);
          i = context.i;
          if (!isQuoted && typeof value === 'string' && (value.indexOf(': ') !== -1 || value.indexOf(":\n") !== -1)) {
            try {
              value = this.parseMapping('{' + value + '}');
            } catch (error) {
              e = error;
            }
          }
          output.push(value);
          --i;
      }
      ++i;
    }
    throw new ParseMore('Malformed inline YAML string ' + sequence);
  };

  Inline.parseMapping = function(mapping, context) {
    var done, i, key, len, output, shouldContinueWhileLoop, value;
    output = {};
    len = mapping.length;
    i = context.i;
    i += 1;
    shouldContinueWhileLoop = false;
    while (i < len) {
      context.i = i;
      switch (mapping.charAt(i)) {
        case ' ':
        case ',':
        case "\n":
          ++i;
          context.i = i;
          shouldContinueWhileLoop = true;
          break;
        case '}':
          return output;
      }
      if (shouldContinueWhileLoop) {
        shouldContinueWhileLoop = false;
        continue;
      }
      key = this.parseScalar(mapping, [':', ' ', "\n"], ['"', "'"], context, false);
      i = context.i;
      done = false;
      while (i < len) {
        context.i = i;
        switch (mapping.charAt(i)) {
          case '[':
            value = this.parseSequence(mapping, context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            break;
          case '{':
            value = this.parseMapping(mapping, context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            break;
          case ':':
          case ' ':
          case "\n":
            break;
          default:
            value = this.parseScalar(mapping, [',', '}'], ['"', "'"], context);
            i = context.i;
            if (output[key] === void 0) {
              output[key] = value;
            }
            done = true;
            --i;
        }
        ++i;
        if (done) {
          break;
        }
      }
    }
    throw new ParseMore('Malformed inline YAML string ' + mapping);
  };

  Inline.evaluateScalar = function(scalar, context) {
    var cast, date, exceptionOnInvalidType, firstChar, firstSpace, firstWord, objectDecoder, raw, scalarLower, subValue, trimmedScalar;
    scalar = Utils.trim(scalar);
    scalarLower = scalar.toLowerCase();
    switch (scalarLower) {
      case 'null':
      case '':
      case '~':
        return null;
      case 'true':
      case 'yes':
      case 'y':
      case 'on':
        return true;
      case 'false':
      case 'no':
      case 'n':
      case 'off':
        return false;
      case '.inf':
        return 2e308;
      case '.nan':
        return 0/0;
      case '-.inf':
        return 2e308;
      default:
        firstChar = scalarLower.charAt(0);
        switch (firstChar) {
          case '!':
            firstSpace = scalar.indexOf(' ');
            if (firstSpace === -1) {
              firstWord = scalarLower;
            } else {
              firstWord = scalarLower.slice(0, firstSpace);
            }
            switch (firstWord) {
              case '!':
                if (firstSpace !== -1) {
                  return parseInt(this.parseScalar(scalar.slice(2)));
                }
                return null;
              case '!str':
                return Utils.ltrim(scalar.slice(4));
              case '!!str':
                return Utils.ltrim(scalar.slice(5));
              case '!!int':
                return parseInt(this.parseScalar(scalar.slice(5)));
              case '!!bool':
                return Utils.parseBoolean(this.parseScalar(scalar.slice(6)), false);
              case '!!float':
                return parseFloat(this.parseScalar(scalar.slice(7)));
              case '!!timestamp':
                return Utils.stringToDate(Utils.ltrim(scalar.slice(11)));
              default:
                if (context == null) {
                  context = {
                    exceptionOnInvalidType: this.settings.exceptionOnInvalidType,
                    objectDecoder: this.settings.objectDecoder,
                    i: 0
                  };
                }
                objectDecoder = context.objectDecoder, exceptionOnInvalidType = context.exceptionOnInvalidType;
                if (objectDecoder) {
                  trimmedScalar = Utils.rtrim(scalar);
                  firstSpace = trimmedScalar.indexOf(' ');
                  if (firstSpace === -1) {
                    return objectDecoder(trimmedScalar, null);
                  } else {
                    subValue = Utils.ltrim(trimmedScalar.slice(firstSpace + 1));
                    if (!(subValue.length > 0)) {
                      subValue = null;
                    }
                    return objectDecoder(trimmedScalar.slice(0, firstSpace), subValue);
                  }
                }
                if (exceptionOnInvalidType) {
                  throw new ParseException('Custom object support when parsing a YAML file has been disabled.');
                }
                return null;
            }
            break;
          case '0':
            if ('0x' === scalar.slice(0, 2)) {
              return Utils.hexDec(scalar);
            } else if (Utils.isDigits(scalar)) {
              return Utils.octDec(scalar);
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else {
              return scalar;
            }
            break;
          case '+':
            if (Utils.isDigits(scalar)) {
              raw = scalar;
              cast = parseInt(raw);
              if (raw === String(cast)) {
                return cast;
              } else {
                return raw;
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
          case '-':
            if (Utils.isDigits(scalar.slice(1))) {
              if ('0' === scalar.charAt(1)) {
                return -Utils.octDec(scalar.slice(1));
              } else {
                raw = scalar.slice(1);
                cast = parseInt(raw);
                if (raw === String(cast)) {
                  return -cast;
                } else {
                  return -raw;
                }
              }
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
          default:
            if (date = Utils.stringToDate(scalar)) {
              return date;
            } else if (Utils.isNumeric(scalar)) {
              return parseFloat(scalar);
            } else if (this.PATTERN_THOUSAND_NUMERIC_SCALAR.test(scalar)) {
              return parseFloat(scalar.replace(',', ''));
            }
            return scalar;
        }
    }
  };

  return Inline;

})();

module.exports = Inline;


},{"./Escaper":2,"./Exception/DumpException":3,"./Exception/ParseException":4,"./Exception/ParseMore":5,"./Pattern":8,"./Unescaper":9,"./Utils":10}],7:[function(require,module,exports){
var Inline, ParseException, ParseMore, Parser, Pattern, Utils;

Inline = require('./Inline');

Pattern = require('./Pattern');

Utils = require('./Utils');

ParseException = require('./Exception/ParseException');

ParseMore = require('./Exception/ParseMore');

Parser = (function() {
  Parser.prototype.PATTERN_FOLDED_SCALAR_ALL = new Pattern('^(?:(?<type>![^\\|>]*)\\s+)?(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$');

  Parser.prototype.PATTERN_FOLDED_SCALAR_END = new Pattern('(?<separator>\\||>)(?<modifiers>\\+|\\-|\\d+|\\+\\d+|\\-\\d+|\\d+\\+|\\d+\\-)?(?<comments> +#.*)?$');

  Parser.prototype.PATTERN_SEQUENCE_ITEM = new Pattern('^\\-((?<leadspaces>\\s+)(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_ANCHOR_VALUE = new Pattern('^&(?<ref>[^ ]+) *(?<value>.*)');

  Parser.prototype.PATTERN_COMPACT_NOTATION = new Pattern('^(?<key>' + Inline.REGEX_QUOTED_STRING + '|[^ \'"\\{\\[].*?) *\\:(\\s+(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_MAPPING_ITEM = new Pattern('^(?<key>' + Inline.REGEX_QUOTED_STRING + '|[^ \'"\\[\\{].*?) *\\:(\\s+(?<value>.+?))?\\s*$');

  Parser.prototype.PATTERN_DECIMAL = new Pattern('\\d+');

  Parser.prototype.PATTERN_INDENT_SPACES = new Pattern('^ +');

  Parser.prototype.PATTERN_TRAILING_LINES = new Pattern('(\n*)$');

  Parser.prototype.PATTERN_YAML_HEADER = new Pattern('^\\%YAML[: ][\\d\\.]+.*\n', 'm');

  Parser.prototype.PATTERN_LEADING_COMMENTS = new Pattern('^(\\#.*?\n)+', 'm');

  Parser.prototype.PATTERN_DOCUMENT_MARKER_START = new Pattern('^\\-\\-\\-.*?\n', 'm');

  Parser.prototype.PATTERN_DOCUMENT_MARKER_END = new Pattern('^\\.\\.\\.\\s*$', 'm');

  Parser.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION = {};

  Parser.prototype.CONTEXT_NONE = 0;

  Parser.prototype.CONTEXT_SEQUENCE = 1;

  Parser.prototype.CONTEXT_MAPPING = 2;

  function Parser(offset) {
    this.offset = offset != null ? offset : 0;
    this.lines = [];
    this.currentLineNb = -1;
    this.currentLine = '';
    this.refs = {};
  }

  Parser.prototype.parse = function(value, exceptionOnInvalidType, objectDecoder) {
    var alias, allowOverwrite, block, c, context, data, e, first, i, indent, isRef, j, k, key, l, lastKey, len, len1, len2, len3, lineCount, m, matches, mergeNode, n, name, parsed, parsedItem, parser, ref, ref1, ref2, refName, refValue, val, values;
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    this.currentLineNb = -1;
    this.currentLine = '';
    this.lines = this.cleanup(value).split("\n");
    data = null;
    context = this.CONTEXT_NONE;
    allowOverwrite = false;
    while (this.moveToNextLine()) {
      if (this.isCurrentLineEmpty()) {
        continue;
      }
      if ("\t" === this.currentLine[0]) {
        throw new ParseException('A YAML file cannot contain tabs as indentation.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
      isRef = mergeNode = false;
      if (values = this.PATTERN_SEQUENCE_ITEM.exec(this.currentLine)) {
        if (this.CONTEXT_MAPPING === context) {
          throw new ParseException('You cannot define a sequence item when in a mapping');
        }
        context = this.CONTEXT_SEQUENCE;
        if (data == null) {
          data = [];
        }
        if ((values.value != null) && (matches = this.PATTERN_ANCHOR_VALUE.exec(values.value))) {
          isRef = matches.ref;
          values.value = matches.value;
        }
        if (!(values.value != null) || '' === Utils.trim(values.value, ' ') || Utils.ltrim(values.value, ' ').indexOf('#') === 0) {
          if (this.currentLineNb < this.lines.length - 1 && !this.isNextLineUnIndentedCollection()) {
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            data.push(parser.parse(this.getNextEmbedBlock(null, true), exceptionOnInvalidType, objectDecoder));
          } else {
            data.push(null);
          }
        } else {
          if (((ref = values.leadspaces) != null ? ref.length : void 0) && (matches = this.PATTERN_COMPACT_NOTATION.exec(values.value))) {
            c = this.getRealCurrentLineNb();
            parser = new Parser(c);
            parser.refs = this.refs;
            block = values.value;
            indent = this.getCurrentLineIndentation();
            if (this.isNextLineIndented(false)) {
              block += "\n" + this.getNextEmbedBlock(indent + values.leadspaces.length + 1, true);
            }
            data.push(parser.parse(block, exceptionOnInvalidType, objectDecoder));
          } else {
            data.push(this.parseValue(values.value, exceptionOnInvalidType, objectDecoder));
          }
        }
      } else if ((values = this.PATTERN_MAPPING_ITEM.exec(this.currentLine)) && values.key.indexOf(' #') === -1) {
        if (this.CONTEXT_SEQUENCE === context) {
          throw new ParseException('You cannot define a mapping item when in a sequence');
        }
        context = this.CONTEXT_MAPPING;
        if (data == null) {
          data = {};
        }
        Inline.configure(exceptionOnInvalidType, objectDecoder);
        try {
          key = Inline.parseScalar(values.key);
        } catch (error) {
          e = error;
          e.parsedLine = this.getRealCurrentLineNb() + 1;
          e.snippet = this.currentLine;
          throw e;
        }
        if ('<<' === key) {
          mergeNode = true;
          allowOverwrite = true;
          if (((ref1 = values.value) != null ? ref1.indexOf('*') : void 0) === 0) {
            refName = values.value.slice(1);
            if (this.refs[refName] == null) {
              throw new ParseException('Reference "' + refName + '" does not exist.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            refValue = this.refs[refName];
            if (typeof refValue !== 'object') {
              throw new ParseException('YAML merge keys used with a scalar value instead of an object.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            if (refValue instanceof Array) {
              for (i = j = 0, len = refValue.length; j < len; i = ++j) {
                value = refValue[i];
                if (data[name = String(i)] == null) {
                  data[name] = value;
                }
              }
            } else {
              for (key in refValue) {
                value = refValue[key];
                if (data[key] == null) {
                  data[key] = value;
                }
              }
            }
          } else {
            if ((values.value != null) && values.value !== '') {
              value = values.value;
            } else {
              value = this.getNextEmbedBlock();
            }
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            parsed = parser.parse(value, exceptionOnInvalidType);
            if (typeof parsed !== 'object') {
              throw new ParseException('YAML merge keys used with a scalar value instead of an object.', this.getRealCurrentLineNb() + 1, this.currentLine);
            }
            if (parsed instanceof Array) {
              for (l = 0, len1 = parsed.length; l < len1; l++) {
                parsedItem = parsed[l];
                if (typeof parsedItem !== 'object') {
                  throw new ParseException('Merge items must be objects.', this.getRealCurrentLineNb() + 1, parsedItem);
                }
                if (parsedItem instanceof Array) {
                  for (i = m = 0, len2 = parsedItem.length; m < len2; i = ++m) {
                    value = parsedItem[i];
                    k = String(i);
                    if (!data.hasOwnProperty(k)) {
                      data[k] = value;
                    }
                  }
                } else {
                  for (key in parsedItem) {
                    value = parsedItem[key];
                    if (!data.hasOwnProperty(key)) {
                      data[key] = value;
                    }
                  }
                }
              }
            } else {
              for (key in parsed) {
                value = parsed[key];
                if (!data.hasOwnProperty(key)) {
                  data[key] = value;
                }
              }
            }
          }
        } else if ((values.value != null) && (matches = this.PATTERN_ANCHOR_VALUE.exec(values.value))) {
          isRef = matches.ref;
          values.value = matches.value;
        }
        if (mergeNode) {

        } else if (!(values.value != null) || '' === Utils.trim(values.value, ' ') || Utils.ltrim(values.value, ' ').indexOf('#') === 0) {
          if (!(this.isNextLineIndented()) && !(this.isNextLineUnIndentedCollection())) {
            if (allowOverwrite || data[key] === void 0) {
              data[key] = null;
            }
          } else {
            c = this.getRealCurrentLineNb() + 1;
            parser = new Parser(c);
            parser.refs = this.refs;
            val = parser.parse(this.getNextEmbedBlock(), exceptionOnInvalidType, objectDecoder);
            if (allowOverwrite || data[key] === void 0) {
              data[key] = val;
            }
          }
        } else {
          val = this.parseValue(values.value, exceptionOnInvalidType, objectDecoder);
          if (allowOverwrite || data[key] === void 0) {
            data[key] = val;
          }
        }
      } else {
        lineCount = this.lines.length;
        if (1 === lineCount || (2 === lineCount && Utils.isEmpty(this.lines[1]))) {
          try {
            value = Inline.parse(this.lines[0], exceptionOnInvalidType, objectDecoder);
          } catch (error) {
            e = error;
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
          if (typeof value === 'object') {
            if (value instanceof Array) {
              first = value[0];
            } else {
              for (key in value) {
                first = value[key];
                break;
              }
            }
            if (typeof first === 'string' && first.indexOf('*') === 0) {
              data = [];
              for (n = 0, len3 = value.length; n < len3; n++) {
                alias = value[n];
                data.push(this.refs[alias.slice(1)]);
              }
              value = data;
            }
          }
          return value;
        } else if ((ref2 = Utils.ltrim(value).charAt(0)) === '[' || ref2 === '{') {
          try {
            return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
          } catch (error) {
            e = error;
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
        }
        throw new ParseException('Unable to parse.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
      if (isRef) {
        if (data instanceof Array) {
          this.refs[isRef] = data[data.length - 1];
        } else {
          lastKey = null;
          for (key in data) {
            lastKey = key;
          }
          this.refs[isRef] = data[lastKey];
        }
      }
    }
    if (Utils.isEmpty(data)) {
      return null;
    } else {
      return data;
    }
  };

  Parser.prototype.getRealCurrentLineNb = function() {
    return this.currentLineNb + this.offset;
  };

  Parser.prototype.getCurrentLineIndentation = function() {
    return this.currentLine.length - Utils.ltrim(this.currentLine, ' ').length;
  };

  Parser.prototype.getNextEmbedBlock = function(indentation, includeUnindentedCollection) {
    var data, indent, isItUnindentedCollection, newIndent, removeComments, removeCommentsPattern, unindentedEmbedBlock;
    if (indentation == null) {
      indentation = null;
    }
    if (includeUnindentedCollection == null) {
      includeUnindentedCollection = false;
    }
    this.moveToNextLine();
    if (indentation == null) {
      newIndent = this.getCurrentLineIndentation();
      unindentedEmbedBlock = this.isStringUnIndentedCollectionItem(this.currentLine);
      if (!(this.isCurrentLineEmpty()) && 0 === newIndent && !unindentedEmbedBlock) {
        throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
    } else {
      newIndent = indentation;
    }
    data = [this.currentLine.slice(newIndent)];
    if (!includeUnindentedCollection) {
      isItUnindentedCollection = this.isStringUnIndentedCollectionItem(this.currentLine);
    }
    removeCommentsPattern = this.PATTERN_FOLDED_SCALAR_END;
    removeComments = !removeCommentsPattern.test(this.currentLine);
    while (this.moveToNextLine()) {
      indent = this.getCurrentLineIndentation();
      if (indent === newIndent) {
        removeComments = !removeCommentsPattern.test(this.currentLine);
      }
      if (removeComments && this.isCurrentLineComment()) {
        continue;
      }
      if (this.isCurrentLineBlank()) {
        data.push(this.currentLine.slice(newIndent));
        continue;
      }
      if (isItUnindentedCollection && !this.isStringUnIndentedCollectionItem(this.currentLine) && indent === newIndent) {
        this.moveToPreviousLine();
        break;
      }
      if (indent >= newIndent) {
        data.push(this.currentLine.slice(newIndent));
      } else if (Utils.ltrim(this.currentLine).charAt(0) === '#') {

      } else if (0 === indent) {
        this.moveToPreviousLine();
        break;
      } else {
        throw new ParseException('Indentation problem.', this.getRealCurrentLineNb() + 1, this.currentLine);
      }
    }
    return data.join("\n");
  };

  Parser.prototype.moveToNextLine = function() {
    if (this.currentLineNb >= this.lines.length - 1) {
      return false;
    }
    this.currentLine = this.lines[++this.currentLineNb];
    return true;
  };

  Parser.prototype.moveToPreviousLine = function() {
    this.currentLine = this.lines[--this.currentLineNb];
  };

  Parser.prototype.parseValue = function(value, exceptionOnInvalidType, objectDecoder) {
    var e, foldedIndent, matches, modifiers, pos, ref, ref1, val;
    if (0 === value.indexOf('*')) {
      pos = value.indexOf('#');
      if (pos !== -1) {
        value = value.substr(1, pos - 2);
      } else {
        value = value.slice(1);
      }
      if (this.refs[value] === void 0) {
        throw new ParseException('Reference "' + value + '" does not exist.', this.currentLine);
      }
      return this.refs[value];
    }
    if (matches = this.PATTERN_FOLDED_SCALAR_ALL.exec(value)) {
      modifiers = (ref = matches.modifiers) != null ? ref : '';
      foldedIndent = Math.abs(parseInt(modifiers));
      if (isNaN(foldedIndent)) {
        foldedIndent = 0;
      }
      val = this.parseFoldedScalar(matches.separator, this.PATTERN_DECIMAL.replace(modifiers, ''), foldedIndent);
      if (matches.type != null) {
        Inline.configure(exceptionOnInvalidType, objectDecoder);
        return Inline.parseScalar(matches.type + ' ' + val);
      } else {
        return val;
      }
    }
    if ((ref1 = value.charAt(0)) === '[' || ref1 === '{' || ref1 === '"' || ref1 === "'") {
      while (true) {
        try {
          return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
        } catch (error) {
          e = error;
          if (e instanceof ParseMore && this.moveToNextLine()) {
            value += "\n" + Utils.trim(this.currentLine, ' ');
          } else {
            e.parsedLine = this.getRealCurrentLineNb() + 1;
            e.snippet = this.currentLine;
            throw e;
          }
        }
      }
    } else {
      if (this.isNextLineIndented()) {
        value += "\n" + this.getNextEmbedBlock();
      }
      return Inline.parse(value, exceptionOnInvalidType, objectDecoder);
    }
  };

  Parser.prototype.parseFoldedScalar = function(separator, indicator, indentation) {
    var isCurrentLineBlank, j, len, line, matches, newText, notEOF, pattern, ref, text;
    if (indicator == null) {
      indicator = '';
    }
    if (indentation == null) {
      indentation = 0;
    }
    notEOF = this.moveToNextLine();
    if (!notEOF) {
      return '';
    }
    isCurrentLineBlank = this.isCurrentLineBlank();
    text = '';
    while (notEOF && isCurrentLineBlank) {
      if (notEOF = this.moveToNextLine()) {
        text += "\n";
        isCurrentLineBlank = this.isCurrentLineBlank();
      }
    }
    if (0 === indentation) {
      if (matches = this.PATTERN_INDENT_SPACES.exec(this.currentLine)) {
        indentation = matches[0].length;
      }
    }
    if (indentation > 0) {
      pattern = this.PATTERN_FOLDED_SCALAR_BY_INDENTATION[indentation];
      if (pattern == null) {
        pattern = new Pattern('^ {' + indentation + '}(.*)$');
        Parser.prototype.PATTERN_FOLDED_SCALAR_BY_INDENTATION[indentation] = pattern;
      }
      while (notEOF && (isCurrentLineBlank || (matches = pattern.exec(this.currentLine)))) {
        if (isCurrentLineBlank) {
          text += this.currentLine.slice(indentation);
        } else {
          text += matches[1];
        }
        if (notEOF = this.moveToNextLine()) {
          text += "\n";
          isCurrentLineBlank = this.isCurrentLineBlank();
        }
      }
    } else if (notEOF) {
      text += "\n";
    }
    if (notEOF) {
      this.moveToPreviousLine();
    }
    if ('>' === separator) {
      newText = '';
      ref = text.split("\n");
      for (j = 0, len = ref.length; j < len; j++) {
        line = ref[j];
        if (line.length === 0 || line.charAt(0) === ' ') {
          newText = Utils.rtrim(newText, ' ') + line + "\n";
        } else {
          newText += line + ' ';
        }
      }
      text = newText;
    }
    if ('+' !== indicator) {
      text = Utils.rtrim(text);
    }
    if ('' === indicator) {
      text = this.PATTERN_TRAILING_LINES.replace(text, "\n");
    } else if ('-' === indicator) {
      text = this.PATTERN_TRAILING_LINES.replace(text, '');
    }
    return text;
  };

  Parser.prototype.isNextLineIndented = function(ignoreComments) {
    var EOF, currentIndentation, ret;
    if (ignoreComments == null) {
      ignoreComments = true;
    }
    currentIndentation = this.getCurrentLineIndentation();
    EOF = !this.moveToNextLine();
    if (ignoreComments) {
      while (!EOF && this.isCurrentLineEmpty()) {
        EOF = !this.moveToNextLine();
      }
    } else {
      while (!EOF && this.isCurrentLineBlank()) {
        EOF = !this.moveToNextLine();
      }
    }
    if (EOF) {
      return false;
    }
    ret = false;
    if (this.getCurrentLineIndentation() > currentIndentation) {
      ret = true;
    }
    this.moveToPreviousLine();
    return ret;
  };

  Parser.prototype.isCurrentLineEmpty = function() {
    var trimmedLine;
    trimmedLine = Utils.trim(this.currentLine, ' ');
    return trimmedLine.length === 0 || trimmedLine.charAt(0) === '#';
  };

  Parser.prototype.isCurrentLineBlank = function() {
    return '' === Utils.trim(this.currentLine, ' ');
  };

  Parser.prototype.isCurrentLineComment = function() {
    var ltrimmedLine;
    ltrimmedLine = Utils.ltrim(this.currentLine, ' ');
    return ltrimmedLine.charAt(0) === '#';
  };

  Parser.prototype.cleanup = function(value) {
    var count, i, indent, j, l, len, len1, line, lines, ref, ref1, ref2, smallestIndent, trimmedValue;
    if (value.indexOf("\r") !== -1) {
      value = value.split("\r\n").join("\n").split("\r").join("\n");
    }
    count = 0;
    ref = this.PATTERN_YAML_HEADER.replaceAll(value, ''), value = ref[0], count = ref[1];
    this.offset += count;
    ref1 = this.PATTERN_LEADING_COMMENTS.replaceAll(value, '', 1), trimmedValue = ref1[0], count = ref1[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
    }
    ref2 = this.PATTERN_DOCUMENT_MARKER_START.replaceAll(value, '', 1), trimmedValue = ref2[0], count = ref2[1];
    if (count === 1) {
      this.offset += Utils.subStrCount(value, "\n") - Utils.subStrCount(trimmedValue, "\n");
      value = trimmedValue;
      value = this.PATTERN_DOCUMENT_MARKER_END.replace(value, '');
    }
    lines = value.split("\n");
    smallestIndent = -1;
    for (j = 0, len = lines.length; j < len; j++) {
      line = lines[j];
      if (Utils.trim(line, ' ').length === 0) {
        continue;
      }
      indent = line.length - Utils.ltrim(line).length;
      if (smallestIndent === -1 || indent < smallestIndent) {
        smallestIndent = indent;
      }
    }
    if (smallestIndent > 0) {
      for (i = l = 0, len1 = lines.length; l < len1; i = ++l) {
        line = lines[i];
        lines[i] = line.slice(smallestIndent);
      }
      value = lines.join("\n");
    }
    return value;
  };

  Parser.prototype.isNextLineUnIndentedCollection = function(currentIndentation) {
    var notEOF, ret;
    if (currentIndentation == null) {
      currentIndentation = null;
    }
    if (currentIndentation == null) {
      currentIndentation = this.getCurrentLineIndentation();
    }
    notEOF = this.moveToNextLine();
    while (notEOF && this.isCurrentLineEmpty()) {
      notEOF = this.moveToNextLine();
    }
    if (false === notEOF) {
      return false;
    }
    ret = false;
    if (this.getCurrentLineIndentation() === currentIndentation && this.isStringUnIndentedCollectionItem(this.currentLine)) {
      ret = true;
    }
    this.moveToPreviousLine();
    return ret;
  };

  Parser.prototype.isStringUnIndentedCollectionItem = function() {
    return this.currentLine === '-' || this.currentLine.slice(0, 2) === '- ';
  };

  return Parser;

})();

module.exports = Parser;


},{"./Exception/ParseException":4,"./Exception/ParseMore":5,"./Inline":6,"./Pattern":8,"./Utils":10}],8:[function(require,module,exports){
var Pattern;

Pattern = (function() {
  Pattern.prototype.regex = null;

  Pattern.prototype.rawRegex = null;

  Pattern.prototype.cleanedRegex = null;

  Pattern.prototype.mapping = null;

  function Pattern(rawRegex, modifiers) {
    var _char, capturingBracketNumber, cleanedRegex, i, len, mapping, name, part, subChar;
    if (modifiers == null) {
      modifiers = '';
    }
    cleanedRegex = '';
    len = rawRegex.length;
    mapping = null;
    capturingBracketNumber = 0;
    i = 0;
    while (i < len) {
      _char = rawRegex.charAt(i);
      if (_char === '\\') {
        cleanedRegex += rawRegex.slice(i, +(i + 1) + 1 || 9e9);
        i++;
      } else if (_char === '(') {
        if (i < len - 2) {
          part = rawRegex.slice(i, +(i + 2) + 1 || 9e9);
          if (part === '(?:') {
            i += 2;
            cleanedRegex += part;
          } else if (part === '(?<') {
            capturingBracketNumber++;
            i += 2;
            name = '';
            while (i + 1 < len) {
              subChar = rawRegex.charAt(i + 1);
              if (subChar === '>') {
                cleanedRegex += '(';
                i++;
                if (name.length > 0) {
                  if (mapping == null) {
                    mapping = {};
                  }
                  mapping[name] = capturingBracketNumber;
                }
                break;
              } else {
                name += subChar;
              }
              i++;
            }
          } else {
            cleanedRegex += _char;
            capturingBracketNumber++;
          }
        } else {
          cleanedRegex += _char;
        }
      } else {
        cleanedRegex += _char;
      }
      i++;
    }
    this.rawRegex = rawRegex;
    this.cleanedRegex = cleanedRegex;
    this.regex = new RegExp(this.cleanedRegex, 'g' + modifiers.replace('g', ''));
    this.mapping = mapping;
  }

  Pattern.prototype.exec = function(str) {
    var index, matches, name, ref;
    this.regex.lastIndex = 0;
    matches = this.regex.exec(str);
    if (matches == null) {
      return null;
    }
    if (this.mapping != null) {
      ref = this.mapping;
      for (name in ref) {
        index = ref[name];
        matches[name] = matches[index];
      }
    }
    return matches;
  };

  Pattern.prototype.test = function(str) {
    this.regex.lastIndex = 0;
    return this.regex.test(str);
  };

  Pattern.prototype.replace = function(str, replacement) {
    this.regex.lastIndex = 0;
    return str.replace(this.regex, replacement);
  };

  Pattern.prototype.replaceAll = function(str, replacement, limit) {
    var count;
    if (limit == null) {
      limit = 0;
    }
    this.regex.lastIndex = 0;
    count = 0;
    while (this.regex.test(str) && (limit === 0 || count < limit)) {
      this.regex.lastIndex = 0;
      str = str.replace(this.regex, replacement);
      count++;
    }
    return [str, count];
  };

  return Pattern;

})();

module.exports = Pattern;


},{}],9:[function(require,module,exports){
var Pattern, Unescaper, Utils;

Utils = require('./Utils');

Pattern = require('./Pattern');

Unescaper = (function() {
  function Unescaper() {}

  Unescaper.PATTERN_ESCAPED_CHARACTER = new Pattern('\\\\([0abt\tnvfre "\\/\\\\N_LP]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{8})');

  Unescaper.unescapeSingleQuotedString = function(value) {
    return value.replace(/\'\'/g, '\'');
  };

  Unescaper.unescapeDoubleQuotedString = function(value) {
    if (this._unescapeCallback == null) {
      this._unescapeCallback = (function(_this) {
        return function(str) {
          return _this.unescapeCharacter(str);
        };
      })(this);
    }
    return this.PATTERN_ESCAPED_CHARACTER.replace(value, this._unescapeCallback);
  };

  Unescaper.unescapeCharacter = function(value) {
    var ch;
    ch = String.fromCharCode;
    switch (value.charAt(1)) {
      case '0':
        return ch(0);
      case 'a':
        return ch(7);
      case 'b':
        return ch(8);
      case 't':
        return "\t";
      case "\t":
        return "\t";
      case 'n':
        return "\n";
      case 'v':
        return ch(11);
      case 'f':
        return ch(12);
      case 'r':
        return ch(13);
      case 'e':
        return ch(27);
      case ' ':
        return ' ';
      case '"':
        return '"';
      case '/':
        return '/';
      case '\\':
        return '\\';
      case 'N':
        return ch(0x0085);
      case '_':
        return ch(0x00A0);
      case 'L':
        return ch(0x2028);
      case 'P':
        return ch(0x2029);
      case 'x':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 2)));
      case 'u':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 4)));
      case 'U':
        return Utils.utf8chr(Utils.hexDec(value.substr(2, 8)));
      default:
        return '';
    }
  };

  return Unescaper;

})();

module.exports = Unescaper;


},{"./Pattern":8,"./Utils":10}],10:[function(require,module,exports){
var Pattern, Utils,
  hasProp = {}.hasOwnProperty;

Pattern = require('./Pattern');

Utils = (function() {
  function Utils() {}

  Utils.REGEX_LEFT_TRIM_BY_CHAR = {};

  Utils.REGEX_RIGHT_TRIM_BY_CHAR = {};

  Utils.REGEX_SPACES = /\s+/g;

  Utils.REGEX_DIGITS = /^\d+$/;

  Utils.REGEX_OCTAL = /[^0-7]/gi;

  Utils.REGEX_HEXADECIMAL = /[^a-f0-9]/gi;

  Utils.PATTERN_DATE = new Pattern('^' + '(?<year>[0-9][0-9][0-9][0-9])' + '-(?<month>[0-9][0-9]?)' + '-(?<day>[0-9][0-9]?)' + '(?:(?:[Tt]|[ \t]+)' + '(?<hour>[0-9][0-9]?)' + ':(?<minute>[0-9][0-9])' + ':(?<second>[0-9][0-9])' + '(?:\.(?<fraction>[0-9]*))?' + '(?:[ \t]*(?<tz>Z|(?<tz_sign>[-+])(?<tz_hour>[0-9][0-9]?)' + '(?::(?<tz_minute>[0-9][0-9]))?))?)?' + '$', 'i');

  Utils.LOCAL_TIMEZONE_OFFSET = new Date().getTimezoneOffset() * 60 * 1000;

  Utils.trim = function(str, _char) {
    var regexLeft, regexRight;
    if (_char == null) {
      _char = '\\s';
    }
    regexLeft = this.REGEX_LEFT_TRIM_BY_CHAR[_char];
    if (regexLeft == null) {
      this.REGEX_LEFT_TRIM_BY_CHAR[_char] = regexLeft = new RegExp('^' + _char + '' + _char + '*');
    }
    regexLeft.lastIndex = 0;
    regexRight = this.REGEX_RIGHT_TRIM_BY_CHAR[_char];
    if (regexRight == null) {
      this.REGEX_RIGHT_TRIM_BY_CHAR[_char] = regexRight = new RegExp(_char + '' + _char + '*$');
    }
    regexRight.lastIndex = 0;
    return str.replace(regexLeft, '').replace(regexRight, '');
  };

  Utils.ltrim = function(str, _char) {
    var regexLeft;
    if (_char == null) {
      _char = '\\s';
    }
    regexLeft = this.REGEX_LEFT_TRIM_BY_CHAR[_char];
    if (regexLeft == null) {
      this.REGEX_LEFT_TRIM_BY_CHAR[_char] = regexLeft = new RegExp('^' + _char + '' + _char + '*');
    }
    regexLeft.lastIndex = 0;
    return str.replace(regexLeft, '');
  };

  Utils.rtrim = function(str, _char) {
    var regexRight;
    if (_char == null) {
      _char = '\\s';
    }
    regexRight = this.REGEX_RIGHT_TRIM_BY_CHAR[_char];
    if (regexRight == null) {
      this.REGEX_RIGHT_TRIM_BY_CHAR[_char] = regexRight = new RegExp(_char + '' + _char + '*$');
    }
    regexRight.lastIndex = 0;
    return str.replace(regexRight, '');
  };

  Utils.isEmpty = function(value) {
    return !value || value === '' || value === '0' || (value instanceof Array && value.length === 0) || this.isEmptyObject(value);
  };

  Utils.isEmptyObject = function(value) {
    var k;
    return value instanceof Object && ((function() {
      var results;
      results = [];
      for (k in value) {
        if (!hasProp.call(value, k)) continue;
        results.push(k);
      }
      return results;
    })()).length === 0;
  };

  Utils.subStrCount = function(string, subString, start, length) {
    var c, i, j, len, ref, sublen;
    c = 0;
    string = '' + string;
    subString = '' + subString;
    if (start != null) {
      string = string.slice(start);
    }
    if (length != null) {
      string = string.slice(0, length);
    }
    len = string.length;
    sublen = subString.length;
    for (i = j = 0, ref = len; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (subString === string.slice(i, sublen)) {
        c++;
        i += sublen - 1;
      }
    }
    return c;
  };

  Utils.isDigits = function(input) {
    this.REGEX_DIGITS.lastIndex = 0;
    return this.REGEX_DIGITS.test(input);
  };

  Utils.octDec = function(input) {
    this.REGEX_OCTAL.lastIndex = 0;
    return parseInt((input + '').replace(this.REGEX_OCTAL, ''), 8);
  };

  Utils.hexDec = function(input) {
    this.REGEX_HEXADECIMAL.lastIndex = 0;
    input = this.trim(input);
    if ((input + '').slice(0, 2) === '0x') {
      input = (input + '').slice(2);
    }
    return parseInt((input + '').replace(this.REGEX_HEXADECIMAL, ''), 16);
  };

  Utils.utf8chr = function(c) {
    var ch;
    ch = String.fromCharCode;
    if (0x80 > (c %= 0x200000)) {
      return ch(c);
    }
    if (0x800 > c) {
      return ch(0xC0 | c >> 6) + ch(0x80 | c & 0x3F);
    }
    if (0x10000 > c) {
      return ch(0xE0 | c >> 12) + ch(0x80 | c >> 6 & 0x3F) + ch(0x80 | c & 0x3F);
    }
    return ch(0xF0 | c >> 18) + ch(0x80 | c >> 12 & 0x3F) + ch(0x80 | c >> 6 & 0x3F) + ch(0x80 | c & 0x3F);
  };

  Utils.parseBoolean = function(input, strict) {
    var lowerInput;
    if (strict == null) {
      strict = true;
    }
    if (typeof input === 'string') {
      lowerInput = input.toLowerCase();
      if (!strict) {
        if (lowerInput === 'no') {
          return false;
        }
      }
      if (lowerInput === '0') {
        return false;
      }
      if (lowerInput === 'false') {
        return false;
      }
      if (lowerInput === '') {
        return false;
      }
      return true;
    }
    return !!input;
  };

  Utils.isNumeric = function(input) {
    this.REGEX_SPACES.lastIndex = 0;
    return typeof input === 'number' || typeof input === 'string' && !isNaN(input) && input.replace(this.REGEX_SPACES, '') !== '';
  };

  Utils.stringToDate = function(str) {
    var date, day, fraction, hour, info, minute, month, second, tz_hour, tz_minute, tz_offset, year;
    if (!(str != null ? str.length : void 0)) {
      return null;
    }
    info = this.PATTERN_DATE.exec(str);
    if (!info) {
      return null;
    }
    year = parseInt(info.year, 10);
    month = parseInt(info.month, 10) - 1;
    day = parseInt(info.day, 10);
    if (info.hour == null) {
      date = new Date(Date.UTC(year, month, day));
      return date;
    }
    hour = parseInt(info.hour, 10);
    minute = parseInt(info.minute, 10);
    second = parseInt(info.second, 10);
    if (info.fraction != null) {
      fraction = info.fraction.slice(0, 3);
      while (fraction.length < 3) {
        fraction += '0';
      }
      fraction = parseInt(fraction, 10);
    } else {
      fraction = 0;
    }
    if (info.tz != null) {
      tz_hour = parseInt(info.tz_hour, 10);
      if (info.tz_minute != null) {
        tz_minute = parseInt(info.tz_minute, 10);
      } else {
        tz_minute = 0;
      }
      tz_offset = (tz_hour * 60 + tz_minute) * 60000;
      if ('-' === info.tz_sign) {
        tz_offset *= -1;
      }
    }
    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (tz_offset) {
      date.setTime(date.getTime() - tz_offset);
    }
    return date;
  };

  Utils.strRepeat = function(str, number) {
    var i, res;
    res = '';
    i = 0;
    while (i < number) {
      res += str;
      i++;
    }
    return res;
  };

  Utils.getStringFromFile = function(path, callback) {
    var data, fs, j, len1, name, ref, req, xhr;
    if (callback == null) {
      callback = null;
    }
    xhr = null;
    if (typeof window !== "undefined" && window !== null) {
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        ref = ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          name = ref[j];
          try {
            xhr = new ActiveXObject(name);
          } catch (error) {}
        }
      }
    }
    if (xhr != null) {
      if (callback != null) {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
              return callback(xhr.responseText);
            } else {
              return callback(null);
            }
          }
        };
        xhr.open('GET', path, true);
        return xhr.send(null);
      } else {
        xhr.open('GET', path, false);
        xhr.send(null);
        if (xhr.status === 200 || xhr.status === 0) {
          return xhr.responseText;
        }
        return null;
      }
    } else {
      req = require;
      fs = req('fs');
      if (callback != null) {
        return fs.readFile(path, function(err, data) {
          if (err) {
            return callback(null);
          } else {
            return callback(String(data));
          }
        });
      } else {
        data = fs.readFileSync(path);
        if (data != null) {
          return String(data);
        }
        return null;
      }
    }
  };

  return Utils;

})();

module.exports = Utils;


},{"./Pattern":8}],11:[function(require,module,exports){
var Dumper, Parser, Utils, Yaml;

Parser = require('./Parser');

Dumper = require('./Dumper');

Utils = require('./Utils');

Yaml = (function() {
  function Yaml() {}

  Yaml.parse = function(input, exceptionOnInvalidType, objectDecoder) {
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    return new Parser().parse(input, exceptionOnInvalidType, objectDecoder);
  };

  Yaml.parseFile = function(path, callback, exceptionOnInvalidType, objectDecoder) {
    var input;
    if (callback == null) {
      callback = null;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectDecoder == null) {
      objectDecoder = null;
    }
    if (callback != null) {
      return Utils.getStringFromFile(path, (function(_this) {
        return function(input) {
          var result;
          result = null;
          if (input != null) {
            result = _this.parse(input, exceptionOnInvalidType, objectDecoder);
          }
          callback(result);
        };
      })(this));
    } else {
      input = Utils.getStringFromFile(path);
      if (input != null) {
        return this.parse(input, exceptionOnInvalidType, objectDecoder);
      }
      return null;
    }
  };

  Yaml.dump = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    var yaml;
    if (inline == null) {
      inline = 2;
    }
    if (indent == null) {
      indent = 4;
    }
    if (exceptionOnInvalidType == null) {
      exceptionOnInvalidType = false;
    }
    if (objectEncoder == null) {
      objectEncoder = null;
    }
    yaml = new Dumper();
    yaml.indentation = indent;
    return yaml.dump(input, inline, 0, exceptionOnInvalidType, objectEncoder);
  };

  Yaml.register = function() {
    var require_handler;
    require_handler = function(module, filename) {
      return module.exports = YAML.parseFile(filename);
    };
    if ((typeof require !== "undefined" && require !== null ? require.extensions : void 0) != null) {
      require.extensions['.yml'] = require_handler;
      return require.extensions['.yaml'] = require_handler;
    }
  };

  Yaml.stringify = function(input, inline, indent, exceptionOnInvalidType, objectEncoder) {
    return this.dump(input, inline, indent, exceptionOnInvalidType, objectEncoder);
  };

  Yaml.load = function(path, callback, exceptionOnInvalidType, objectDecoder) {
    return this.parseFile(path, callback, exceptionOnInvalidType, objectDecoder);
  };

  return Yaml;

})();

if (typeof window !== "undefined" && window !== null) {
  window.YAML = Yaml;
}

if (typeof window === "undefined" || window === null) {
  this.YAML = Yaml;
}

module.exports = Yaml;


},{"./Dumper":1,"./Parser":7,"./Utils":10}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9EdW1wZXIuY29mZmVlIiwic3JjL0VzY2FwZXIuY29mZmVlIiwic3JjL0V4Y2VwdGlvbi9EdW1wRXhjZXB0aW9uLmNvZmZlZSIsInNyYy9FeGNlcHRpb24vUGFyc2VFeGNlcHRpb24uY29mZmVlIiwic3JjL0V4Y2VwdGlvbi9QYXJzZU1vcmUuY29mZmVlIiwic3JjL0lubGluZS5jb2ZmZWUiLCJzcmMvUGFyc2VyLmNvZmZlZSIsInNyYy9QYXR0ZXJuLmNvZmZlZSIsInNyYy9VbmVzY2FwZXIuY29mZmVlIiwic3JjL1V0aWxzLmNvZmZlZSIsInNyYy9ZYW1sLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0NBLElBQUE7O0FBQUEsS0FBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFJSjs7O0VBR0YsTUFBQyxDQUFBLFdBQUQsR0FBZ0I7O21CQWFoQixJQUFBLEdBQU0sU0FBQyxLQUFELEVBQVEsTUFBUixFQUFvQixNQUFwQixFQUFnQyxzQkFBaEMsRUFBZ0UsYUFBaEU7QUFDRixRQUFBOztNQURVLFNBQVM7OztNQUFHLFNBQVM7OztNQUFHLHlCQUF5Qjs7O01BQU8sZ0JBQWdCOztJQUNsRixNQUFBLEdBQVM7SUFDVCxNQUFBLEdBQVMsQ0FBSSxNQUFILEdBQWUsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsR0FBaEIsRUFBcUIsTUFBckIsQ0FBZixHQUFpRCxFQUFsRDtJQUVULElBQUcsTUFBQSxJQUFVLENBQVYsSUFBZSxPQUFPLEtBQVAsS0FBbUIsUUFBbEMsSUFBOEMsS0FBQSxZQUFpQixJQUEvRCxJQUF1RSxLQUFLLENBQUMsT0FBTixDQUFjLEtBQWQsQ0FBMUU7TUFDSSxNQUFBLElBQVUsTUFBQSxHQUFTLE1BQU0sQ0FBQyxJ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QixJQUFJLENBQUMsU0FBTCxDQUFlLFFBQWY7SUFGSDtJQU1sQixJQUFHLDBGQUFIO01BQ0ksT0FBTyxDQUFDLFVBQVcsQ0FBQSxNQUFBLENBQW5CLEdBQTZCO2FBQzdCLE9BQU8sQ0FBQyxVQUFXLENBQUEsT0FBQSxDQUFuQixHQUE4QixnQkFGbEM7O0VBUE87O0VBY1gsSUFBQyxDQUFBLFNBQUQsR0FBWSxTQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCLE1BQWhCLEVBQXdCLHNCQUF4QixFQUFnRCxhQUFoRDtBQUNSLFdBQU8sSUFBQyxDQUFBLElBQUQsQ0FBTSxLQUFOLEVBQWEsTUFBYixFQUFxQixNQUFyQixFQUE2QixzQkFBN0IsRUFBcUQsYUFBckQ7RUFEQzs7RUFNWixJQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsc0JBQWpCLEVBQXlDLGFBQXpDO0FBQ0gsV0FBTyxJQUFDLENBQUEsU0FBRCxDQUFXLElBQVgsRUFBaUIsUUFBakIsRUFBMkIsc0JBQTNCLEVBQW1ELGFBQW5EO0VBREo7Ozs7Ozs7RUFLWCxNQUFNLENBQUUsSUFBUixHQUFlOzs7QUFHZixJQUFPLGdEQUFQO0VBQ0ksSUFBQyxDQUFBLElBQUQsR0FBUSxLQURaOzs7QUFHQSxNQUFNLENBQUMsT0FBUCxHQUFpQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcblV0aWxzICAgPSByZXF1aXJlICcuL1V0aWxzJ1xuSW5saW5lICA9IHJlcXVpcmUgJy4vSW5saW5lJ1xuXG4jIER1bXBlciBkdW1wcyBKYXZhU2NyaXB0IHZhcmlhYmxlcyB0byBZQU1MIHN0cmluZ3MuXG4jXG5jbGFzcyBEdW1wZXJcblxuICAgICMgVGhlIGFtb3VudCBvZiBzcGFjZXMgdG8gdXNlIGZvciBpbmRlbnRhdGlvbiBvZiBuZXN0ZWQgbm9kZXMuXG4gICAgQGluZGVudGF0aW9uOiAgIDRcblxuXG4gICAgIyBEdW1wcyBhIEphdmFTY3JpcHQgdmFsdWUgdG8gWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBpbnB1dCAgICAgICAgICAgICAgICAgICBUaGUgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgaW5saW5lICAgICAgICAgICAgICAgICAgVGhlIGxldmVsIHdoZXJlIHlvdSBzd2l0Y2ggdG8gaW5saW5lIFlBTUxcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIGluZGVudCAgICAgICAgICAgICAgICAgIFRoZSBsZXZlbCBvZiBpbmRlbnRhdGlvbiAodXNlZCBpbnRlcm5hbGx5KVxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RW5jb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgVGhlIFlBTUwgcmVwcmVzZW50YXRpb24gb2YgdGhlIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjXG4gICAgZHVtcDogKGlucHV0LCBpbmxpbmUgPSAwLCBpbmRlbnQgPSAwLCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdEVuY29kZXIgPSBudWxsKSAtPlxuICAgICAgICBvdXRwdXQgPSAnJ1xuICAgICAgICBwcmVmaXggPSAoaWYgaW5kZW50IHRoZW4gVXRpbHMuc3RyUmVwZWF0KCcgJywgaW5kZW50KSBlbHNlICcnKVxuXG4gICAgICAgIGlmIGlubGluZSA8PSAwIG9yIHR5cGVvZihpbnB1dCkgaXNudCAnb2JqZWN0JyBvciBpbnB1dCBpbnN0YW5jZW9mIERhdGUgb3IgVXRpbHMuaXNFbXB0eShpbnB1dClcbiAgICAgICAgICAgIG91dHB1dCArPSBwcmVmaXggKyBJbmxpbmUuZHVtcChpbnB1dCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcilcbiAgICAgICAgXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIGlucHV0IGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICBmb3IgdmFsdWUgaW4gaW5wdXRcbiAgICAgICAgICAgICAgICAgICAgd2lsbEJlSW5saW5lZCA9IChpbmxpbmUgLSAxIDw9IDAgb3IgdHlwZW9mKHZhbHVlKSBpc250ICdvYmplY3QnIG9yIFV0aWxzLmlzRW1wdHkodmFsdWUpKVxuXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICctJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAoaWYgd2lsbEJlSW5saW5lZCB0aGVuICcgJyBlbHNlIFwiXFxuXCIpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIEBkdW1wKHZhbHVlLCBpbmxpbmUgLSAxLCAoaWYgd2lsbEJlSW5saW5lZCB0aGVuIDAgZWxzZSBpbmRlbnQgKyBAaW5kZW50YXRpb24pLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3RFbmNvZGVyKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoaWYgd2lsbEJlSW5saW5lZCB0aGVuIFwiXFxuXCIgZWxzZSAnJylcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZvciBrZXksIHZhbHVlIG9mIGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHdpbGxCZUlubGluZWQgPSAoaW5saW5lIC0gMSA8PSAwIG9yIHR5cGVvZih2YWx1ZSkgaXNudCAnb2JqZWN0JyBvciBVdGlscy5pc0VtcHR5KHZhbHVlKSlcblxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz1cbiAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeCArXG4gICAgICAgICAgICAgICAgICAgICAgICBJbmxpbmUuZHVtcChrZXksIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXIpICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChpZiB3aWxsQmVJbmxpbmVkIHRoZW4gJyAnIGVsc2UgXCJcXG5cIikgK1xuICAgICAgICAgICAgICAgICAgICAgICAgQGR1bXAodmFsdWUsIGlubGluZSAtIDEsIChpZiB3aWxsQmVJbmxpbmVkIHRoZW4gMCBlbHNlIGluZGVudCArIEBpbmRlbnRhdGlvbiksIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdEVuY29kZXIpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChpZiB3aWxsQmVJbmxpbmVkIHRoZW4gXCJcXG5cIiBlbHNlICcnKVxuXG4gICAgICAgIHJldHVybiBvdXRwdXRcblxuXG5tb2R1bGUuZXhwb3J0cyA9IER1bXBlclxuIiwiXG5QYXR0ZXJuID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuXG4jIEVzY2FwZXIgZW5jYXBzdWxhdGVzIGVzY2FwaW5nIHJ1bGVzIGZvciBzaW5nbGVcbiMgYW5kIGRvdWJsZS1xdW90ZWQgWUFNTCBzdHJpbmdzLlxuY2xhc3MgRXNjYXBlclxuXG4gICAgIyBNYXBwaW5nIGFycmF5cyBmb3IgZXNjYXBpbmcgYSBkb3VibGUgcXVvdGVkIHN0cmluZy4gVGhlIGJhY2tzbGFzaCBpc1xuICAgICMgZmlyc3QgdG8gZW5zdXJlIHByb3BlciBlc2NhcGluZy5cbiAgICBATElTVF9FU0NBUEVFUzogICAgICAgICAgICAgICAgIFsnXFxcXCcsICdcXFxcXFxcXCcsICdcXFxcXCInLCAnXCInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFx4MDBcIiwgIFwiXFx4MDFcIiwgIFwiXFx4MDJcIiwgIFwiXFx4MDNcIiwgIFwiXFx4MDRcIiwgIFwiXFx4MDVcIiwgIFwiXFx4MDZcIiwgIFwiXFx4MDdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxceDA4XCIsICBcIlxceDA5XCIsICBcIlxceDBhXCIsICBcIlxceDBiXCIsICBcIlxceDBjXCIsICBcIlxceDBkXCIsICBcIlxceDBlXCIsICBcIlxceDBmXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXHgxMFwiLCAgXCJcXHgxMVwiLCAgXCJcXHgxMlwiLCAgXCJcXHgxM1wiLCAgXCJcXHgxNFwiLCAgXCJcXHgxNVwiLCAgXCJcXHgxNlwiLCAgXCJcXHgxN1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFx4MThcIiwgIFwiXFx4MTlcIiwgIFwiXFx4MWFcIiwgIFwiXFx4MWJcIiwgIFwiXFx4MWNcIiwgIFwiXFx4MWRcIiwgIFwiXFx4MWVcIiwgIFwiXFx4MWZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlKSgweDAwODUpLCBjaCgweDAwQTApLCBjaCgweDIwMjgpLCBjaCgweDIwMjkpXVxuICAgIEBMSVNUX0VTQ0FQRUQ6ICAgICAgICAgICAgICAgICAgWydcXFxcXFxcXCcsICdcXFxcXCInLCAnXFxcXFwiJywgJ1xcXFxcIicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXFxcMFwiLCAgIFwiXFxcXHgwMVwiLCBcIlxcXFx4MDJcIiwgXCJcXFxceDAzXCIsIFwiXFxcXHgwNFwiLCBcIlxcXFx4MDVcIiwgXCJcXFxceDA2XCIsIFwiXFxcXGFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcXFxiXCIsICAgXCJcXFxcdFwiLCAgIFwiXFxcXG5cIiwgICBcIlxcXFx2XCIsICAgXCJcXFxcZlwiLCAgIFwiXFxcXHJcIiwgICBcIlxcXFx4MGVcIiwgXCJcXFxceDBmXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcXFxceDEwXCIsIFwiXFxcXHgxMVwiLCBcIlxcXFx4MTJcIiwgXCJcXFxceDEzXCIsIFwiXFxcXHgxNFwiLCBcIlxcXFx4MTVcIiwgXCJcXFxceDE2XCIsIFwiXFxcXHgxN1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXFxcXHgxOFwiLCBcIlxcXFx4MTlcIiwgXCJcXFxceDFhXCIsIFwiXFxcXGVcIiwgICBcIlxcXFx4MWNcIiwgXCJcXFxceDFkXCIsIFwiXFxcXHgxZVwiLCBcIlxcXFx4MWZcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlxcXFxOXCIsIFwiXFxcXF9cIiwgXCJcXFxcTFwiLCBcIlxcXFxQXCJdXG5cbiAgICBATUFQUElOR19FU0NBUEVFU19UT19FU0NBUEVEOiAgIGRvID0+XG4gICAgICAgIG1hcHBpbmcgPSB7fVxuICAgICAgICBmb3IgaSBpbiBbMC4uLkBMSVNUX0VTQ0FQRUVTLmxlbmd0aF1cbiAgICAgICAgICAgIG1hcHBpbmdbQExJU1RfRVNDQVBFRVNbaV1dID0gQExJU1RfRVNDQVBFRFtpXVxuICAgICAgICByZXR1cm4gbWFwcGluZ1xuXG4gICAgIyBDaGFyYWN0ZXJzIHRoYXQgd291bGQgY2F1c2UgYSBkdW1wZWQgc3RyaW5nIHRvIHJlcXVpcmUgZG91YmxlIHF1b3RpbmcuXG4gICAgQFBBVFRFUk5fQ0hBUkFDVEVSU19UT19FU0NBUEU6ICBuZXcgUGF0dGVybiAnW1xcXFx4MDAtXFxcXHgxZl18XFx4YzJcXHg4NXxcXHhjMlxceGEwfFxceGUyXFx4ODBcXHhhOHxcXHhlMlxceDgwXFx4YTknXG5cbiAgICAjIE90aGVyIHByZWNvbXBpbGVkIHBhdHRlcm5zXG4gICAgQFBBVFRFUk5fTUFQUElOR19FU0NBUEVFUzogICAgICBuZXcgUGF0dGVybiBATElTVF9FU0NBUEVFUy5qb2luKCd8Jykuc3BsaXQoJ1xcXFwnKS5qb2luKCdcXFxcXFxcXCcpXG4gICAgQFBBVFRFUk5fU0lOR0xFX1FVT1RJTkc6ICAgICAgICBuZXcgUGF0dGVybiAnW1xcJ1wiOnt9W1xcXFxdLCojP118XlstP3w8Pj0hJUBgXSdcblxuXG5cbiAgICAjIERldGVybWluZXMgaWYgYSBKYXZhU2NyaXB0IHZhbHVlIHdvdWxkIHJlcXVpcmUgZG91YmxlIHF1b3RpbmcgaW4gWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgIEEgSmF2YVNjcmlwdCB2YWx1ZSB2YWx1ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dIHRydWUgICAgaWYgdGhlIHZhbHVlIHdvdWxkIHJlcXVpcmUgZG91YmxlIHF1b3Rlcy5cbiAgICAjXG4gICAgQHJlcXVpcmVzRG91YmxlUXVvdGluZzogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gQFBBVFRFUk5fQ0hBUkFDVEVSU19UT19FU0NBUEUudGVzdCB2YWx1ZVxuXG5cbiAgICAjIEVzY2FwZXMgYW5kIHN1cnJvdW5kcyBhIEphdmFTY3JpcHQgdmFsdWUgd2l0aCBkb3VibGUgcXVvdGVzLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgQSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgVGhlIHF1b3RlZCwgZXNjYXBlZCBzdHJpbmdcbiAgICAjXG4gICAgQGVzY2FwZVdpdGhEb3VibGVRdW90ZXM6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmVzdWx0ID0gQFBBVFRFUk5fTUFQUElOR19FU0NBUEVFUy5yZXBsYWNlIHZhbHVlLCAoc3RyKSA9PlxuICAgICAgICAgICAgcmV0dXJuIEBNQVBQSU5HX0VTQ0FQRUVTX1RPX0VTQ0FQRURbc3RyXVxuICAgICAgICByZXR1cm4gJ1wiJytyZXN1bHQrJ1wiJ1xuXG5cbiAgICAjIERldGVybWluZXMgaWYgYSBKYXZhU2NyaXB0IHZhbHVlIHdvdWxkIHJlcXVpcmUgc2luZ2xlIHF1b3RpbmcgaW4gWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgIEEgSmF2YVNjcmlwdCB2YWx1ZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dIHRydWUgaWYgdGhlIHZhbHVlIHdvdWxkIHJlcXVpcmUgc2luZ2xlIHF1b3Rlcy5cbiAgICAjXG4gICAgQHJlcXVpcmVzU2luZ2xlUXVvdGluZzogKHZhbHVlKSAtPlxuICAgICAgICByZXR1cm4gQFBBVFRFUk5fU0lOR0xFX1FVT1RJTkcudGVzdCB2YWx1ZVxuXG5cbiAgICAjIEVzY2FwZXMgYW5kIHN1cnJvdW5kcyBhIEphdmFTY3JpcHQgdmFsdWUgd2l0aCBzaW5nbGUgcXVvdGVzLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgQSBKYXZhU2NyaXB0IHZhbHVlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgVGhlIHF1b3RlZCwgZXNjYXBlZCBzdHJpbmdcbiAgICAjXG4gICAgQGVzY2FwZVdpdGhTaW5nbGVRdW90ZXM6ICh2YWx1ZSkgLT5cbiAgICAgICAgcmV0dXJuIFwiJ1wiK3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKStcIidcIlxuXG5cbm1vZHVsZS5leHBvcnRzID0gRXNjYXBlclxuIiwiXG5jbGFzcyBEdW1wRXhjZXB0aW9uIGV4dGVuZHMgRXJyb3JcblxuICAgIGNvbnN0cnVjdG9yOiAoQG1lc3NhZ2UsIEBwYXJzZWRMaW5lLCBAc25pcHBldCkgLT5cblxuICAgIHRvU3RyaW5nOiAtPlxuICAgICAgICBpZiBAcGFyc2VkTGluZT8gYW5kIEBzbmlwcGV0P1xuICAgICAgICAgICAgcmV0dXJuICc8RHVtcEV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlICsgJyAobGluZSAnICsgQHBhcnNlZExpbmUgKyAnOiBcXCcnICsgQHNuaXBwZXQgKyAnXFwnKSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuICc8RHVtcEV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlXG5cbm1vZHVsZS5leHBvcnRzID0gRHVtcEV4Y2VwdGlvblxuIiwiXG5jbGFzcyBQYXJzZUV4Y2VwdGlvbiBleHRlbmRzIEVycm9yXG5cbiAgICBjb25zdHJ1Y3RvcjogKEBtZXNzYWdlLCBAcGFyc2VkTGluZSwgQHNuaXBwZXQpIC0+XG5cbiAgICB0b1N0cmluZzogLT5cbiAgICAgICAgaWYgQHBhcnNlZExpbmU/IGFuZCBAc25pcHBldD9cbiAgICAgICAgICAgIHJldHVybiAnPFBhcnNlRXhjZXB0aW9uPiAnICsgQG1lc3NhZ2UgKyAnIChsaW5lICcgKyBAcGFyc2VkTGluZSArICc6IFxcJycgKyBAc25pcHBldCArICdcXCcpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gJzxQYXJzZUV4Y2VwdGlvbj4gJyArIEBtZXNzYWdlXG5cbm1vZHVsZS5leHBvcnRzID0gUGFyc2VFeGNlcHRpb25cbiIsIlxuY2xhc3MgUGFyc2VNb3JlIGV4dGVuZHMgRXJyb3JcblxuICAgIGNvbnN0cnVjdG9yOiAoQG1lc3NhZ2UsIEBwYXJzZWRMaW5lLCBAc25pcHBldCkgLT5cblxuICAgIHRvU3RyaW5nOiAtPlxuICAgICAgICBpZiBAcGFyc2VkTGluZT8gYW5kIEBzbmlwcGV0P1xuICAgICAgICAgICAgcmV0dXJuICc8UGFyc2VNb3JlPiAnICsgQG1lc3NhZ2UgKyAnIChsaW5lICcgKyBAcGFyc2VkTGluZSArICc6IFxcJycgKyBAc25pcHBldCArICdcXCcpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4gJzxQYXJzZU1vcmU+ICcgKyBAbWVzc2FnZVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnNlTW9yZVxuIiwiXG5QYXR0ZXJuICAgICAgICAgPSByZXF1aXJlICcuL1BhdHRlcm4nXG5VbmVzY2FwZXIgICAgICAgPSByZXF1aXJlICcuL1VuZXNjYXBlcidcbkVzY2FwZXIgICAgICAgICA9IHJlcXVpcmUgJy4vRXNjYXBlcidcblV0aWxzICAgICAgICAgICA9IHJlcXVpcmUgJy4vVXRpbHMnXG5QYXJzZUV4Y2VwdGlvbiAgPSByZXF1aXJlICcuL0V4Y2VwdGlvbi9QYXJzZUV4Y2VwdGlvbidcblBhcnNlTW9yZSAgICAgICA9IHJlcXVpcmUgJy4vRXhjZXB0aW9uL1BhcnNlTW9yZSdcbkR1bXBFeGNlcHRpb24gICA9IHJlcXVpcmUgJy4vRXhjZXB0aW9uL0R1bXBFeGNlcHRpb24nXG5cbiMgSW5saW5lIFlBTUwgcGFyc2luZyBhbmQgZHVtcGluZ1xuY2xhc3MgSW5saW5lXG5cbiAgICAjIFF1b3RlZCBzdHJpbmcgcmVndWxhciBleHByZXNzaW9uXG4gICAgQFJFR0VYX1FVT1RFRF9TVFJJTkc6ICAgICAgICAgICAgICAgJyg/OlwiKD86W15cIlxcXFxcXFxcXSooPzpcXFxcXFxcXC5bXlwiXFxcXFxcXFxdKikqKVwifFxcJyg/OlteXFwnXSooPzpcXCdcXCdbXlxcJ10qKSopXFwnKSdcblxuICAgICMgUHJlLWNvbXBpbGVkIHBhdHRlcm5zXG4gICAgI1xuICAgIEBQQVRURVJOX1RSQUlMSU5HX0NPTU1FTlRTOiAgICAgICAgIG5ldyBQYXR0ZXJuICdeXFxcXHMqIy4qJCdcbiAgICBAUEFUVEVSTl9RVU9URURfU0NBTEFSOiAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXicrQFJFR0VYX1FVT1RFRF9TVFJJTkdcbiAgICBAUEFUVEVSTl9USE9VU0FORF9OVU1FUklDX1NDQUxBUjogICBuZXcgUGF0dGVybiAnXigtfFxcXFwrKT9bMC05LF0rKFxcXFwuWzAtOV0rKT8kJ1xuICAgIEBQQVRURVJOX1NDQUxBUl9CWV9ERUxJTUlURVJTOiAgICAgIHt9XG5cbiAgICAjIFNldHRpbmdzXG4gICAgQHNldHRpbmdzOiB7fVxuXG5cbiAgICAjIENvbmZpZ3VyZSBZQU1MIGlubGluZS5cbiAgICAjXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIChhIEphdmFTY3JpcHQgcmVzb3VyY2Ugb3Igb2JqZWN0KSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICBAY29uZmlndXJlOiAoZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IG51bGwsIG9iamVjdERlY29kZXIgPSBudWxsKSAtPlxuICAgICAgICAjIFVwZGF0ZSBzZXR0aW5nc1xuICAgICAgICBAc2V0dGluZ3MuZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGV4Y2VwdGlvbk9uSW52YWxpZFR5cGVcbiAgICAgICAgQHNldHRpbmdzLm9iamVjdERlY29kZXIgPSBvYmplY3REZWNvZGVyXG4gICAgICAgIHJldHVyblxuXG5cbiAgICAjIENvbnZlcnRzIGEgWUFNTCBzdHJpbmcgdG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICB2YWx1ZSAgICAgICAgICAgICAgICAgICBBIFlBTUwgc3RyaW5nXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICBleGNlcHRpb25PbkludmFsaWRUeXBlICB0cnVlIGlmIGFuIGV4Y2VwdGlvbiBtdXN0IGJlIHRocm93biBvbiBpbnZhbGlkIHR5cGVzIChhIEphdmFTY3JpcHQgcmVzb3VyY2Ugb3Igb2JqZWN0KSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gIEEgSmF2YVNjcmlwdCBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBZQU1MIHN0cmluZ1xuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VFeGNlcHRpb25dXG4gICAgI1xuICAgIEBwYXJzZTogKHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdERlY29kZXIgPSBudWxsKSAtPlxuICAgICAgICAjIFVwZGF0ZSBzZXR0aW5ncyBmcm9tIGxhc3QgY2FsbCBvZiBJbmxpbmUucGFyc2UoKVxuICAgICAgICBAc2V0dGluZ3MuZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGV4Y2VwdGlvbk9uSW52YWxpZFR5cGVcbiAgICAgICAgQHNldHRpbmdzLm9iamVjdERlY29kZXIgPSBvYmplY3REZWNvZGVyXG5cbiAgICAgICAgaWYgbm90IHZhbHVlP1xuICAgICAgICAgICAgcmV0dXJuICcnXG5cbiAgICAgICAgdmFsdWUgPSBVdGlscy50cmltIHZhbHVlXG5cbiAgICAgICAgaWYgMCBpcyB2YWx1ZS5sZW5ndGhcbiAgICAgICAgICAgIHJldHVybiAnJ1xuXG4gICAgICAgICMgS2VlcCBhIGNvbnRleHQgb2JqZWN0IHRvIHBhc3MgdGhyb3VnaCBzdGF0aWMgbWV0aG9kc1xuICAgICAgICBjb250ZXh0ID0ge2V4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXIsIGk6IDB9XG5cbiAgICAgICAgc3dpdGNoIHZhbHVlLmNoYXJBdCgwKVxuICAgICAgICAgICAgd2hlbiAnWydcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGFyc2VTZXF1ZW5jZSB2YWx1ZSwgY29udGV4dFxuICAgICAgICAgICAgICAgICsrY29udGV4dC5pXG4gICAgICAgICAgICB3aGVuICd7J1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBwYXJzZU1hcHBpbmcgdmFsdWUsIGNvbnRleHRcbiAgICAgICAgICAgICAgICArK2NvbnRleHQuaVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBwYXJzZVNjYWxhciB2YWx1ZSwgbnVsbCwgWydcIicsIFwiJ1wiXSwgY29udGV4dFxuXG4gICAgICAgICMgU29tZSBjb21tZW50cyBhcmUgYWxsb3dlZCBhdCB0aGUgZW5kXG4gICAgICAgIGlmIEBQQVRURVJOX1RSQUlMSU5HX0NPTU1FTlRTLnJlcGxhY2UodmFsdWVbY29udGV4dC5pLi5dLCAnJykgaXNudCAnJ1xuICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdVbmV4cGVjdGVkIGNoYXJhY3RlcnMgbmVhciBcIicrdmFsdWVbY29udGV4dC5pLi5dKydcIi4nXG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuXG5cbiAgICAjIER1bXBzIGEgZ2l2ZW4gSmF2YVNjcmlwdCB2YXJpYWJsZSB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIHZhbHVlICAgICAgICAgICAgICAgICAgIFRoZSBKYXZhU2NyaXB0IHZhcmlhYmxlIHRvIGNvbnZlcnRcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgIHRydWUgaWYgYW4gZXhjZXB0aW9uIG11c3QgYmUgdGhyb3duIG9uIGludmFsaWQgdHlwZXMgKGEgSmF2YVNjcmlwdCByZXNvdXJjZSBvciBvYmplY3QpLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdEVuY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSBZQU1MIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgICMgQHRocm93IFtEdW1wRXhjZXB0aW9uXVxuICAgICNcbiAgICBAZHVtcDogKHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdEVuY29kZXIgPSBudWxsKSAtPlxuICAgICAgICBpZiBub3QgdmFsdWU/XG4gICAgICAgICAgICByZXR1cm4gJ251bGwnXG4gICAgICAgIHR5cGUgPSB0eXBlb2YgdmFsdWVcbiAgICAgICAgaWYgdHlwZSBpcyAnb2JqZWN0J1xuICAgICAgICAgICAgaWYgb2JqZWN0RW5jb2Rlcj9cbiAgICAgICAgICAgICAgICByZXN1bHQgPSBvYmplY3RFbmNvZGVyIHZhbHVlXG4gICAgICAgICAgICAgICAgaWYgdHlwZW9mIHJlc3VsdCBpcyAnc3RyaW5nJyBvciByZXN1bHQ/XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICAgIGlmIHZhbHVlIGluc3RhbmNlb2YgRGF0ZVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICByZXR1cm4gQGR1bXBPYmplY3QgdmFsdWVcbiAgICAgICAgaWYgdHlwZSBpcyAnYm9vbGVhbidcbiAgICAgICAgICAgIHJldHVybiAoaWYgdmFsdWUgdGhlbiAneWVzJyBlbHNlICdubycpXG4gICAgICAgIGlmIFV0aWxzLmlzRGlnaXRzKHZhbHVlKVxuICAgICAgICAgICAgcmV0dXJuIChpZiB0eXBlIGlzICdzdHJpbmcnIHRoZW4gXCInXCIrdmFsdWUrXCInXCIgZWxzZSBTdHJpbmcocGFyc2VJbnQodmFsdWUpKSlcbiAgICAgICAgaWYgVXRpbHMuaXNOdW1lcmljKHZhbHVlKVxuICAgICAgICAgICAgcmV0dXJuIChpZiB0eXBlIGlzICdzdHJpbmcnIHRoZW4gXCInXCIrdmFsdWUrXCInXCIgZWxzZSBTdHJpbmcocGFyc2VGbG9hdCh2YWx1ZSkpKVxuICAgICAgICBpZiB0eXBlIGlzICdudW1iZXInXG4gICAgICAgICAgICByZXR1cm4gKGlmIHZhbHVlIGlzIEluZmluaXR5IHRoZW4gJy5JbmYnIGVsc2UgKGlmIHZhbHVlIGlzIC1JbmZpbml0eSB0aGVuICctLkluZicgZWxzZSAoaWYgaXNOYU4odmFsdWUpIHRoZW4gJy5OYU4nIGVsc2UgdmFsdWUpKSlcbiAgICAgICAgaWYgRXNjYXBlci5yZXF1aXJlc0RvdWJsZVF1b3RpbmcgdmFsdWVcbiAgICAgICAgICAgIHJldHVybiBFc2NhcGVyLmVzY2FwZVdpdGhEb3VibGVRdW90ZXMgdmFsdWVcbiAgICAgICAgaWYgRXNjYXBlci5yZXF1aXJlc1NpbmdsZVF1b3RpbmcgdmFsdWVcbiAgICAgICAgICAgIHJldHVybiBFc2NhcGVyLmVzY2FwZVdpdGhTaW5nbGVRdW90ZXMgdmFsdWVcbiAgICAgICAgaWYgJycgaXMgdmFsdWVcbiAgICAgICAgICAgIHJldHVybiAnXCJcIidcbiAgICAgICAgaWYgVXRpbHMuUEFUVEVSTl9EQVRFLnRlc3QgdmFsdWVcbiAgICAgICAgICAgIHJldHVybiBcIidcIit2YWx1ZStcIidcIjtcbiAgICAgICAgaWYgdmFsdWUudG9Mb3dlckNhc2UoKSBpbiBbJ251bGwnLCd+JywndHJ1ZScsJ2ZhbHNlJ11cbiAgICAgICAgICAgIHJldHVybiBcIidcIit2YWx1ZStcIidcIlxuICAgICAgICAjIERlZmF1bHRcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuXG5cbiAgICAjIER1bXBzIGEgSmF2YVNjcmlwdCBvYmplY3QgdG8gYSBZQU1MIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICB2YWx1ZSAgICAgICAgICAgICAgICAgICBUaGUgSmF2YVNjcmlwdCBvYmplY3QgdG8gZHVtcFxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RW5jb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiBkbyBzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBzdHJpbmcgVGhlIFlBTUwgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgSmF2YVNjcmlwdCBvYmplY3RcbiAgICAjXG4gICAgQGR1bXBPYmplY3Q6ICh2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0U3VwcG9ydCA9IG51bGwpIC0+XG4gICAgICAgICMgQXJyYXlcbiAgICAgICAgaWYgdmFsdWUgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgb3V0cHV0ID0gW11cbiAgICAgICAgICAgIGZvciB2YWwgaW4gdmFsdWVcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCBAZHVtcCB2YWxcbiAgICAgICAgICAgIHJldHVybiAnWycrb3V0cHV0LmpvaW4oJywgJykrJ10nXG5cbiAgICAgICAgIyBNYXBwaW5nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG91dHB1dCA9IFtdXG4gICAgICAgICAgICBmb3Iga2V5LCB2YWwgb2YgdmFsdWVcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCBAZHVtcChrZXkpKyc6ICcrQGR1bXAodmFsKVxuICAgICAgICAgICAgcmV0dXJuICd7JytvdXRwdXQuam9pbignLCAnKSsnfSdcblxuXG4gICAgIyBQYXJzZXMgYSBzY2FsYXIgdG8gYSBZQU1MIHN0cmluZy5cbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBzY2FsYXJcbiAgICAjIEBwYXJhbSBbQXJyYXldICAgIGRlbGltaXRlcnNcbiAgICAjIEBwYXJhbSBbQXJyYXldICAgIHN0cmluZ0RlbGltaXRlcnNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIGNvbnRleHRcbiAgICAjIEBwYXJhbSBbQm9vbGVhbl0gIGV2YWx1YXRlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgQSBZQU1MIHN0cmluZ1xuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VFeGNlcHRpb25dIFdoZW4gbWFsZm9ybWVkIGlubGluZSBZQU1MIHN0cmluZyBpcyBwYXJzZWRcbiAgICAjXG4gICAgQHBhcnNlU2NhbGFyOiAoc2NhbGFyLCBkZWxpbWl0ZXJzID0gbnVsbCwgc3RyaW5nRGVsaW1pdGVycyA9IFsnXCInLCBcIidcIl0sIGNvbnRleHQgPSBudWxsLCBldmFsdWF0ZSA9IHRydWUpIC0+XG4gICAgICAgIHVubGVzcyBjb250ZXh0P1xuICAgICAgICAgICAgY29udGV4dCA9IGV4Y2VwdGlvbk9uSW52YWxpZFR5cGU6IEBzZXR0aW5ncy5leGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyOiBAc2V0dGluZ3Mub2JqZWN0RGVjb2RlciwgaTogMFxuICAgICAgICB7aX0gPSBjb250ZXh0XG5cbiAgICAgICAgaWYgc2NhbGFyLmNoYXJBdChpKSBpbiBzdHJpbmdEZWxpbWl0ZXJzXG4gICAgICAgICAgICAjIFF1b3RlZCBzY2FsYXJcbiAgICAgICAgICAgIG91dHB1dCA9IEBwYXJzZVF1b3RlZFNjYWxhciBzY2FsYXIsIGNvbnRleHRcbiAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcblxuICAgICAgICAgICAgaWYgZGVsaW1pdGVycz9cbiAgICAgICAgICAgICAgICB0bXAgPSBVdGlscy5sdHJpbSBzY2FsYXJbaS4uXSwgJyAnXG4gICAgICAgICAgICAgICAgaWYgbm90KHRtcC5jaGFyQXQoMCkgaW4gZGVsaW1pdGVycylcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdVbmV4cGVjdGVkIGNoYXJhY3RlcnMgKCcrc2NhbGFyW2kuLl0rJykuJ1xuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICMgXCJub3JtYWxcIiBzdHJpbmdcbiAgICAgICAgICAgIGlmIG5vdCBkZWxpbWl0ZXJzXG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gc2NhbGFyW2kuLl1cbiAgICAgICAgICAgICAgICBpICs9IG91dHB1dC5sZW5ndGhcblxuICAgICAgICAgICAgICAgICMgUmVtb3ZlIGNvbW1lbnRzXG4gICAgICAgICAgICAgICAgc3RycG9zID0gb3V0cHV0LmluZGV4T2YgJyAjJ1xuICAgICAgICAgICAgICAgIGlmIHN0cnBvcyBpc250IC0xXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCA9IFV0aWxzLnJ0cmltIG91dHB1dFswLi4uc3RycG9zXVxuXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgam9pbmVkRGVsaW1pdGVycyA9IGRlbGltaXRlcnMuam9pbignfCcpXG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IEBQQVRURVJOX1NDQUxBUl9CWV9ERUxJTUlURVJTW2pvaW5lZERlbGltaXRlcnNdXG4gICAgICAgICAgICAgICAgdW5sZXNzIHBhdHRlcm4/XG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBuZXcgUGF0dGVybiAnXiguKz8pKCcram9pbmVkRGVsaW1pdGVycysnKSdcbiAgICAgICAgICAgICAgICAgICAgQFBBVFRFUk5fU0NBTEFSX0JZX0RFTElNSVRFUlNbam9pbmVkRGVsaW1pdGVyc10gPSBwYXR0ZXJuXG4gICAgICAgICAgICAgICAgaWYgbWF0Y2ggPSBwYXR0ZXJuLmV4ZWMgc2NhbGFyW2kuLl1cbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ID0gbWF0Y2hbMV1cbiAgICAgICAgICAgICAgICAgICAgaSArPSBvdXRwdXQubGVuZ3RoXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ01hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgKCcrc2NhbGFyKycpLidcblxuXG4gICAgICAgICAgICBpZiBldmFsdWF0ZVxuICAgICAgICAgICAgICAgIG91dHB1dCA9IEBldmFsdWF0ZVNjYWxhciBvdXRwdXQsIGNvbnRleHRcblxuICAgICAgICBjb250ZXh0LmkgPSBpXG4gICAgICAgIHJldHVybiBvdXRwdXRcblxuXG4gICAgIyBQYXJzZXMgYSBxdW90ZWQgc2NhbGFyIHRvIFlBTUwuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgc2NhbGFyXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBjb250ZXh0XG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgQSBZQU1MIHN0cmluZ1xuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VNb3JlXSBXaGVuIG1hbGZvcm1lZCBpbmxpbmUgWUFNTCBzdHJpbmcgaXMgcGFyc2VkXG4gICAgI1xuICAgIEBwYXJzZVF1b3RlZFNjYWxhcjogKHNjYWxhciwgY29udGV4dCkgLT5cbiAgICAgICAge2l9ID0gY29udGV4dFxuXG4gICAgICAgIHVubGVzcyBtYXRjaCA9IEBQQVRURVJOX1FVT1RFRF9TQ0FMQVIuZXhlYyBzY2FsYXJbaS4uXVxuICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlTW9yZSAnTWFsZm9ybWVkIGlubGluZSBZQU1MIHN0cmluZyAoJytzY2FsYXJbaS4uXSsnKS4nXG5cbiAgICAgICAgb3V0cHV0ID0gbWF0Y2hbMF0uc3Vic3RyKDEsIG1hdGNoWzBdLmxlbmd0aCAtIDIpXG5cbiAgICAgICAgaWYgJ1wiJyBpcyBzY2FsYXIuY2hhckF0KGkpXG4gICAgICAgICAgICBvdXRwdXQgPSBVbmVzY2FwZXIudW5lc2NhcGVEb3VibGVRdW90ZWRTdHJpbmcgb3V0cHV0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG91dHB1dCA9IFVuZXNjYXBlci51bmVzY2FwZVNpbmdsZVF1b3RlZFN0cmluZyBvdXRwdXRcblxuICAgICAgICBpICs9IG1hdGNoWzBdLmxlbmd0aFxuXG4gICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgcmV0dXJuIG91dHB1dFxuXG5cbiAgICAjIFBhcnNlcyBhIHNlcXVlbmNlIHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgc2VxdWVuY2VcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSAgIGNvbnRleHRcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICBBIFlBTUwgc3RyaW5nXG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZU1vcmVdIFdoZW4gbWFsZm9ybWVkIGlubGluZSBZQU1MIHN0cmluZyBpcyBwYXJzZWRcbiAgICAjXG4gICAgQHBhcnNlU2VxdWVuY2U6IChzZXF1ZW5jZSwgY29udGV4dCkgLT5cbiAgICAgICAgb3V0cHV0ID0gW11cbiAgICAgICAgbGVuID0gc2VxdWVuY2UubGVuZ3RoXG4gICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgaSArPSAxXG5cbiAgICAgICAgIyBbZm9vLCBiYXIsIC4uLl1cbiAgICAgICAgd2hpbGUgaSA8IGxlblxuICAgICAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICAgICAgc3dpdGNoIHNlcXVlbmNlLmNoYXJBdChpKVxuICAgICAgICAgICAgICAgIHdoZW4gJ1snXG4gICAgICAgICAgICAgICAgICAgICMgTmVzdGVkIHNlcXVlbmNlXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoIEBwYXJzZVNlcXVlbmNlIHNlcXVlbmNlLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICB3aGVuICd7J1xuICAgICAgICAgICAgICAgICAgICAjIE5lc3RlZCBtYXBwaW5nXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoIEBwYXJzZU1hcHBpbmcgc2VxdWVuY2UsIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAge2l9ID0gY29udGV4dFxuICAgICAgICAgICAgICAgIHdoZW4gJ10nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvdXRwdXRcbiAgICAgICAgICAgICAgICB3aGVuICcsJywgJyAnLCBcIlxcblwiXG4gICAgICAgICAgICAgICAgICAgICMgRG8gbm90aGluZ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaXNRdW90ZWQgPSAoc2VxdWVuY2UuY2hhckF0KGkpIGluIFsnXCInLCBcIidcIl0pXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQHBhcnNlU2NhbGFyIHNlcXVlbmNlLCBbJywnLCAnXSddLCBbJ1wiJywgXCInXCJdLCBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcblxuICAgICAgICAgICAgICAgICAgICBpZiBub3QoaXNRdW90ZWQpIGFuZCB0eXBlb2YodmFsdWUpIGlzICdzdHJpbmcnIGFuZCAodmFsdWUuaW5kZXhPZignOiAnKSBpc250IC0xIG9yIHZhbHVlLmluZGV4T2YoXCI6XFxuXCIpIGlzbnQgLTEpXG4gICAgICAgICAgICAgICAgICAgICAgICAjIEVtYmVkZGVkIG1hcHBpbmc/XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IEBwYXJzZU1hcHBpbmcgJ3snK3ZhbHVlKyd9J1xuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgTm8sIGl0J3Mgbm90XG5cblxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaCB2YWx1ZVxuXG4gICAgICAgICAgICAgICAgICAgIC0taVxuXG4gICAgICAgICAgICArK2lcblxuICAgICAgICB0aHJvdyBuZXcgUGFyc2VNb3JlICdNYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nICcrc2VxdWVuY2VcblxuXG4gICAgIyBQYXJzZXMgYSBtYXBwaW5nIHRvIGEgWUFNTCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgbWFwcGluZ1xuICAgICMgQHBhcmFtIFtPYmplY3RdICAgY29udGV4dFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlTW9yZV0gV2hlbiBtYWxmb3JtZWQgaW5saW5lIFlBTUwgc3RyaW5nIGlzIHBhcnNlZFxuICAgICNcbiAgICBAcGFyc2VNYXBwaW5nOiAobWFwcGluZywgY29udGV4dCkgLT5cbiAgICAgICAgb3V0cHV0ID0ge31cbiAgICAgICAgbGVuID0gbWFwcGluZy5sZW5ndGhcbiAgICAgICAge2l9ID0gY29udGV4dFxuICAgICAgICBpICs9IDFcblxuICAgICAgICAjIHtmb286IGJhciwgYmFyOmZvbywgLi4ufVxuICAgICAgICBzaG91bGRDb250aW51ZVdoaWxlTG9vcCA9IGZhbHNlXG4gICAgICAgIHdoaWxlIGkgPCBsZW5cbiAgICAgICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgICAgIHN3aXRjaCBtYXBwaW5nLmNoYXJBdChpKVxuICAgICAgICAgICAgICAgIHdoZW4gJyAnLCAnLCcsIFwiXFxuXCJcbiAgICAgICAgICAgICAgICAgICAgKytpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQuaSA9IGlcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkQ29udGludWVXaGlsZUxvb3AgPSB0cnVlXG4gICAgICAgICAgICAgICAgd2hlbiAnfSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dFxuXG4gICAgICAgICAgICBpZiBzaG91bGRDb250aW51ZVdoaWxlTG9vcFxuICAgICAgICAgICAgICAgIHNob3VsZENvbnRpbnVlV2hpbGVMb29wID0gZmFsc2VcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICAjIEtleVxuICAgICAgICAgICAga2V5ID0gQHBhcnNlU2NhbGFyIG1hcHBpbmcsIFsnOicsICcgJywgXCJcXG5cIl0sIFsnXCInLCBcIidcIl0sIGNvbnRleHQsIGZhbHNlXG4gICAgICAgICAgICB7aX0gPSBjb250ZXh0XG5cbiAgICAgICAgICAgICMgVmFsdWVcbiAgICAgICAgICAgIGRvbmUgPSBmYWxzZVxuXG4gICAgICAgICAgICB3aGlsZSBpIDwgbGVuXG4gICAgICAgICAgICAgICAgY29udGV4dC5pID0gaVxuICAgICAgICAgICAgICAgIHN3aXRjaCBtYXBwaW5nLmNoYXJBdChpKVxuICAgICAgICAgICAgICAgICAgICB3aGVuICdbJ1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBOZXN0ZWQgc2VxdWVuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQHBhcnNlU2VxdWVuY2UgbWFwcGluZywgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAge2l9ID0gY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBTcGVjOiBLZXlzIE1VU1QgYmUgdW5pcXVlOyBmaXJzdCBvbmUgd2lucy5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgUGFyc2VyIGNhbm5vdCBhYm9ydCB0aGlzIG1hcHBpbmcgZWFybGllciwgc2luY2UgbGluZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICMgYXJlIHByb2Nlc3NlZCBzZXF1ZW50aWFsbHkuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvdXRwdXRba2V5XSA9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRba2V5XSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB3aGVuICd7J1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBOZXN0ZWQgbWFwcGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAcGFyc2VNYXBwaW5nIG1hcHBpbmcsIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFBhcnNlciBjYW5ub3QgYWJvcnQgdGhpcyBtYXBwaW5nIGVhcmxpZXIsIHNpbmNlIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGFyZSBwcm9jZXNzZWQgc2VxdWVudGlhbGx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb3V0cHV0W2tleV0gPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0W2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnOicsICcgJywgXCJcXG5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBEbyBub3RoaW5nXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gQHBhcnNlU2NhbGFyIG1hcHBpbmcsIFsnLCcsICd9J10sIFsnXCInLCBcIidcIl0sIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHtpfSA9IGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFBhcnNlciBjYW5ub3QgYWJvcnQgdGhpcyBtYXBwaW5nIGVhcmxpZXIsIHNpbmNlIGxpbmVzXG4gICAgICAgICAgICAgICAgICAgICAgICAjIGFyZSBwcm9jZXNzZWQgc2VxdWVudGlhbGx5LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb3V0cHV0W2tleV0gPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0W2tleV0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIC0taVxuXG4gICAgICAgICAgICAgICAgKytpXG5cbiAgICAgICAgICAgICAgICBpZiBkb25lXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgdGhyb3cgbmV3IFBhcnNlTW9yZSAnTWFsZm9ybWVkIGlubGluZSBZQU1MIHN0cmluZyAnK21hcHBpbmdcblxuXG4gICAgIyBFdmFsdWF0ZXMgc2NhbGFycyBhbmQgcmVwbGFjZXMgbWFnaWMgdmFsdWVzLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHNjYWxhclxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgWUFNTCBzdHJpbmdcbiAgICAjXG4gICAgQGV2YWx1YXRlU2NhbGFyOiAoc2NhbGFyLCBjb250ZXh0KSAtPlxuICAgICAgICBzY2FsYXIgPSBVdGlscy50cmltKHNjYWxhcilcbiAgICAgICAgc2NhbGFyTG93ZXIgPSBzY2FsYXIudG9Mb3dlckNhc2UoKVxuXG4gICAgICAgIHN3aXRjaCBzY2FsYXJMb3dlclxuICAgICAgICAgICAgd2hlbiAnbnVsbCcsICcnLCAnfidcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgd2hlbiAndHJ1ZScsICd5ZXMnLCAneScsICdvbidcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgd2hlbiAnZmFsc2UnLCAnbm8nLCAnbicsICdvZmYnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB3aGVuICcuaW5mJ1xuICAgICAgICAgICAgICAgIHJldHVybiBJbmZpbml0eVxuICAgICAgICAgICAgd2hlbiAnLm5hbidcbiAgICAgICAgICAgICAgICByZXR1cm4gTmFOXG4gICAgICAgICAgICB3aGVuICctLmluZidcbiAgICAgICAgICAgICAgICByZXR1cm4gSW5maW5pdHlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmaXJzdENoYXIgPSBzY2FsYXJMb3dlci5jaGFyQXQoMClcbiAgICAgICAgICAgICAgICBzd2l0Y2ggZmlyc3RDaGFyXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJyEnXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFNwYWNlID0gc2NhbGFyLmluZGV4T2YoJyAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZmlyc3RTcGFjZSBpcyAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0V29yZCA9IHNjYWxhckxvd2VyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RXb3JkID0gc2NhbGFyTG93ZXJbMC4uLmZpcnN0U3BhY2VdXG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggZmlyc3RXb3JkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnISdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgZmlyc3RTcGFjZSBpc250IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQgQHBhcnNlU2NhbGFyKHNjYWxhclsyLi5dKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyFzdHInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy5sdHJpbSBzY2FsYXJbNC4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEhc3RyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMubHRyaW0gc2NhbGFyWzUuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuICchIWludCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KEBwYXJzZVNjYWxhcihzY2FsYXJbNS4uXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnISFib29sJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMucGFyc2VCb29sZWFuKEBwYXJzZVNjYWxhcihzY2FsYXJbNi4uXSksIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gJyEhZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KEBwYXJzZVNjYWxhcihzY2FsYXJbNy4uXSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiAnISF0aW1lc3RhbXAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy5zdHJpbmdUb0RhdGUoVXRpbHMubHRyaW0oc2NhbGFyWzExLi5dKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBjb250ZXh0P1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dCA9IGV4Y2VwdGlvbk9uSW52YWxpZFR5cGU6IEBzZXR0aW5ncy5leGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyOiBAc2V0dGluZ3Mub2JqZWN0RGVjb2RlciwgaTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7b2JqZWN0RGVjb2RlciwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZX0gPSBjb250ZXh0XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqZWN0RGVjb2RlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBJZiBvYmplY3REZWNvZGVyIGZ1bmN0aW9uIGlzIGdpdmVuLCB3ZSBjYW4gZG8gY3VzdG9tIGRlY29kaW5nIG9mIGN1c3RvbSB0eXBlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpbW1lZFNjYWxhciA9IFV0aWxzLnJ0cmltIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RTcGFjZSA9IHRyaW1tZWRTY2FsYXIuaW5kZXhPZignICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBmaXJzdFNwYWNlIGlzIC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdERlY29kZXIgdHJpbW1lZFNjYWxhciwgbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YlZhbHVlID0gVXRpbHMubHRyaW0gdHJpbW1lZFNjYWxhcltmaXJzdFNwYWNlKzEuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3Mgc3ViVmFsdWUubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJWYWx1ZSA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0RGVjb2RlciB0cmltbWVkU2NhbGFyWzAuLi5maXJzdFNwYWNlXSwgc3ViVmFsdWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBleGNlcHRpb25PbkludmFsaWRUeXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ0N1c3RvbSBvYmplY3Qgc3VwcG9ydCB3aGVuIHBhcnNpbmcgYSBZQU1MIGZpbGUgaGFzIGJlZW4gZGlzYWJsZWQuJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJzAnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAnMHgnIGlzIHNjYWxhclswLi4uMl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMuaGV4RGVjIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc0RpZ2l0cyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMub2N0RGVjIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBVdGlscy5pc051bWVyaWMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjYWxhclxuICAgICAgICAgICAgICAgICAgICB3aGVuICcrJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgVXRpbHMuaXNEaWdpdHMgc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF3ID0gc2NhbGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzdCA9IHBhcnNlSW50KHJhdylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiByYXcgaXMgU3RyaW5nKGNhc3QpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmF3XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIFV0aWxzLmlzTnVtZXJpYyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgQFBBVFRFUk5fVEhPVVNBTkRfTlVNRVJJQ19TQ0FMQVIudGVzdCBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzY2FsYXIucmVwbGFjZSgnLCcsICcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIFV0aWxzLmlzRGlnaXRzKHNjYWxhclsxLi5dKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICcwJyBpcyBzY2FsYXIuY2hhckF0KDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtVXRpbHMub2N0RGVjKHNjYWxhclsxLi5dKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF3ID0gc2NhbGFyWzEuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzdCA9IHBhcnNlSW50KHJhdylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcmF3IGlzIFN0cmluZyhjYXN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC1jYXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtcmF3XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIFV0aWxzLmlzTnVtZXJpYyBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgQFBBVFRFUk5fVEhPVVNBTkRfTlVNRVJJQ19TQ0FMQVIudGVzdCBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzY2FsYXIucmVwbGFjZSgnLCcsICcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZGF0ZSA9IFV0aWxzLnN0cmluZ1RvRGF0ZShzY2FsYXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMuaXNOdW1lcmljKHNjYWxhcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgQFBBVFRFUk5fVEhPVVNBTkRfTlVNRVJJQ19TQ0FMQVIudGVzdCBzY2FsYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzY2FsYXIucmVwbGFjZSgnLCcsICcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzY2FsYXJcblxubW9kdWxlLmV4cG9ydHMgPSBJbmxpbmVcbiIsIlxuSW5saW5lICAgICAgICAgID0gcmVxdWlyZSAnLi9JbmxpbmUnXG5QYXR0ZXJuICAgICAgICAgPSByZXF1aXJlICcuL1BhdHRlcm4nXG5VdGlscyAgICAgICAgICAgPSByZXF1aXJlICcuL1V0aWxzJ1xuUGFyc2VFeGNlcHRpb24gID0gcmVxdWlyZSAnLi9FeGNlcHRpb24vUGFyc2VFeGNlcHRpb24nXG5QYXJzZU1vcmUgICAgICAgPSByZXF1aXJlICcuL0V4Y2VwdGlvbi9QYXJzZU1vcmUnXG5cbiMgUGFyc2VyIHBhcnNlcyBZQU1MIHN0cmluZ3MgdG8gY29udmVydCB0aGVtIHRvIEphdmFTY3JpcHQgb2JqZWN0cy5cbiNcbmNsYXNzIFBhcnNlclxuXG4gICAgIyBQcmUtY29tcGlsZWQgcGF0dGVybnNcbiAgICAjXG4gICAgUEFUVEVSTl9GT0xERURfU0NBTEFSX0FMTDogICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeKD86KD88dHlwZT4hW15cXFxcfD5dKilcXFxccyspPyg/PHNlcGFyYXRvcj5cXFxcfHw+KSg/PG1vZGlmaWVycz5cXFxcK3xcXFxcLXxcXFxcZCt8XFxcXCtcXFxcZCt8XFxcXC1cXFxcZCt8XFxcXGQrXFxcXCt8XFxcXGQrXFxcXC0pPyg/PGNvbW1lbnRzPiArIy4qKT8kJ1xuICAgIFBBVFRFUk5fRk9MREVEX1NDQUxBUl9FTkQ6ICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnKD88c2VwYXJhdG9yPlxcXFx8fD4pKD88bW9kaWZpZXJzPlxcXFwrfFxcXFwtfFxcXFxkK3xcXFxcK1xcXFxkK3xcXFxcLVxcXFxkK3xcXFxcZCtcXFxcK3xcXFxcZCtcXFxcLSk/KD88Y29tbWVudHM+ICsjLiopPyQnXG4gICAgUEFUVEVSTl9TRVFVRU5DRV9JVEVNOiAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeXFxcXC0oKD88bGVhZHNwYWNlcz5cXFxccyspKD88dmFsdWU+Lis/KSk/XFxcXHMqJCdcbiAgICBQQVRURVJOX0FOQ0hPUl9WQUxVRTogICAgICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14mKD88cmVmPlteIF0rKSAqKD88dmFsdWU+LiopJ1xuICAgIFBBVFRFUk5fQ09NUEFDVF9OT1RBVElPTjogICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXig/PGtleT4nK0lubGluZS5SRUdFWF9RVU9URURfU1RSSU5HKyd8W14gXFwnXCJcXFxce1xcXFxbXS4qPykgKlxcXFw6KFxcXFxzKyg/PHZhbHVlPi4rPykpP1xcXFxzKiQnXG4gICAgUEFUVEVSTl9NQVBQSU5HX0lURU06ICAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeKD88a2V5PicrSW5saW5lLlJFR0VYX1FVT1RFRF9TVFJJTkcrJ3xbXiBcXCdcIlxcXFxbXFxcXHtdLio/KSAqXFxcXDooXFxcXHMrKD88dmFsdWU+Lis/KSk/XFxcXHMqJCdcbiAgICBQQVRURVJOX0RFQ0lNQUw6ICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ1xcXFxkKydcbiAgICBQQVRURVJOX0lOREVOVF9TUEFDRVM6ICAgICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJ14gKydcbiAgICBQQVRURVJOX1RSQUlMSU5HX0xJTkVTOiAgICAgICAgICAgICAgICAgbmV3IFBhdHRlcm4gJyhcXG4qKSQnXG4gICAgUEFUVEVSTl9ZQU1MX0hFQURFUjogICAgICAgICAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeXFxcXCVZQU1MWzogXVtcXFxcZFxcXFwuXSsuKlxcbicsICdtJ1xuICAgIFBBVFRFUk5fTEVBRElOR19DT01NRU5UUzogICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXihcXFxcIy4qP1xcbikrJywgJ20nXG4gICAgUEFUVEVSTl9ET0NVTUVOVF9NQVJLRVJfU1RBUlQ6ICAgICAgICAgIG5ldyBQYXR0ZXJuICdeXFxcXC1cXFxcLVxcXFwtLio/XFxuJywgJ20nXG4gICAgUEFUVEVSTl9ET0NVTUVOVF9NQVJLRVJfRU5EOiAgICAgICAgICAgIG5ldyBQYXR0ZXJuICdeXFxcXC5cXFxcLlxcXFwuXFxcXHMqJCcsICdtJ1xuICAgIFBBVFRFUk5fRk9MREVEX1NDQUxBUl9CWV9JTkRFTlRBVElPTjogICB7fVxuXG4gICAgIyBDb250ZXh0IHR5cGVzXG4gICAgI1xuICAgIENPTlRFWFRfTk9ORTogICAgICAgMFxuICAgIENPTlRFWFRfU0VRVUVOQ0U6ICAgMVxuICAgIENPTlRFWFRfTUFQUElORzogICAgMlxuXG5cbiAgICAjIENvbnN0cnVjdG9yXG4gICAgI1xuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgb2Zmc2V0ICBUaGUgb2Zmc2V0IG9mIFlBTUwgZG9jdW1lbnQgKHVzZWQgZm9yIGxpbmUgbnVtYmVycyBpbiBlcnJvciBtZXNzYWdlcylcbiAgICAjXG4gICAgY29uc3RydWN0b3I6IChAb2Zmc2V0ID0gMCkgLT5cbiAgICAgICAgQGxpbmVzICAgICAgICAgID0gW11cbiAgICAgICAgQGN1cnJlbnRMaW5lTmIgID0gLTFcbiAgICAgICAgQGN1cnJlbnRMaW5lICAgID0gJydcbiAgICAgICAgQHJlZnMgICAgICAgICAgID0ge31cblxuXG4gICAgIyBQYXJzZXMgYSBZQU1MIHN0cmluZyB0byBhIEphdmFTY3JpcHQgdmFsdWUuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgdmFsdWUgICAgICAgICAgICAgICAgICAgQSBZQU1MIHN0cmluZ1xuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RGVjb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBkZXNlcmlhbGl6ZSBjdXN0b20gb2JqZWN0cywgbnVsbCBvdGhlcndpc2VcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtPYmplY3RdICBBIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBJZiB0aGUgWUFNTCBpcyBub3QgdmFsaWRcbiAgICAjXG4gICAgcGFyc2U6ICh2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgQGN1cnJlbnRMaW5lTmIgPSAtMVxuICAgICAgICBAY3VycmVudExpbmUgPSAnJ1xuICAgICAgICBAbGluZXMgPSBAY2xlYW51cCh2YWx1ZSkuc3BsaXQgXCJcXG5cIlxuXG4gICAgICAgIGRhdGEgPSBudWxsXG4gICAgICAgIGNvbnRleHQgPSBAQ09OVEVYVF9OT05FXG4gICAgICAgIGFsbG93T3ZlcndyaXRlID0gZmFsc2VcbiAgICAgICAgd2hpbGUgQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgICAgIGlmIEBpc0N1cnJlbnRMaW5lRW1wdHkoKVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICMgVGFiP1xuICAgICAgICAgICAgaWYgXCJcXHRcIiBpcyBAY3VycmVudExpbmVbMF1cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ0EgWUFNTCBmaWxlIGNhbm5vdCBjb250YWluIHRhYnMgYXMgaW5kZW50YXRpb24uJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgaXNSZWYgPSBtZXJnZU5vZGUgPSBmYWxzZVxuICAgICAgICAgICAgaWYgdmFsdWVzID0gQFBBVFRFUk5fU0VRVUVOQ0VfSVRFTS5leGVjIEBjdXJyZW50TGluZVxuICAgICAgICAgICAgICAgIGlmIEBDT05URVhUX01BUFBJTkcgaXMgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1lvdSBjYW5ub3QgZGVmaW5lIGEgc2VxdWVuY2UgaXRlbSB3aGVuIGluIGEgbWFwcGluZydcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gQENPTlRFWFRfU0VRVUVOQ0VcbiAgICAgICAgICAgICAgICBkYXRhID89IFtdXG5cbiAgICAgICAgICAgICAgICBpZiB2YWx1ZXMudmFsdWU/IGFuZCBtYXRjaGVzID0gQFBBVFRFUk5fQU5DSE9SX1ZBTFVFLmV4ZWMgdmFsdWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGlzUmVmID0gbWF0Y2hlcy5yZWZcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnZhbHVlID0gbWF0Y2hlcy52YWx1ZVxuXG4gICAgICAgICAgICAgICAgIyBBcnJheVxuICAgICAgICAgICAgICAgIGlmIG5vdCh2YWx1ZXMudmFsdWU/KSBvciAnJyBpcyBVdGlscy50cmltKHZhbHVlcy52YWx1ZSwgJyAnKSBvciBVdGlscy5sdHJpbSh2YWx1ZXMudmFsdWUsICcgJykuaW5kZXhPZignIycpIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgaWYgQGN1cnJlbnRMaW5lTmIgPCBAbGluZXMubGVuZ3RoIC0gMSBhbmQgbm90IEBpc05leHRMaW5lVW5JbmRlbnRlZENvbGxlY3Rpb24oKVxuICAgICAgICAgICAgICAgICAgICAgICAgYyA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyID0gbmV3IFBhcnNlciBjXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIucmVmcyA9IEByZWZzXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2ggcGFyc2VyLnBhcnNlKEBnZXROZXh0RW1iZWRCbG9jayhudWxsLCB0cnVlKSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlcilcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoIG51bGxcblxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWVzLmxlYWRzcGFjZXM/Lmxlbmd0aCBhbmQgbWF0Y2hlcyA9IEBQQVRURVJOX0NPTVBBQ1RfTk9UQVRJT04uZXhlYyB2YWx1ZXMudmFsdWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgIyBUaGlzIGlzIGEgY29tcGFjdCBub3RhdGlvbiBlbGVtZW50LCBhZGQgdG8gbmV4dCBibG9jayBhbmQgcGFyc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VyID0gbmV3IFBhcnNlciBjXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIucmVmcyA9IEByZWZzXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrID0gdmFsdWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRlbnQgPSBAZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbigpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBAaXNOZXh0TGluZUluZGVudGVkKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrICs9IFwiXFxuXCIrQGdldE5leHRFbWJlZEJsb2NrKGluZGVudCArIHZhbHVlcy5sZWFkc3BhY2VzLmxlbmd0aCArIDEsIHRydWUpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaCBwYXJzZXIucGFyc2UgYmxvY2ssIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcblxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2ggQHBhcnNlVmFsdWUgdmFsdWVzLnZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG5cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlcyA9IEBQQVRURVJOX01BUFBJTkdfSVRFTS5leGVjIEBjdXJyZW50TGluZSkgYW5kIHZhbHVlcy5rZXkuaW5kZXhPZignICMnKSBpcyAtMVxuICAgICAgICAgICAgICAgIGlmIEBDT05URVhUX1NFUVVFTkNFIGlzIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdZb3UgY2Fubm90IGRlZmluZSBhIG1hcHBpbmcgaXRlbSB3aGVuIGluIGEgc2VxdWVuY2UnXG4gICAgICAgICAgICAgICAgY29udGV4dCA9IEBDT05URVhUX01BUFBJTkdcbiAgICAgICAgICAgICAgICBkYXRhID89IHt9XG5cbiAgICAgICAgICAgICAgICAjIEZvcmNlIGNvcnJlY3Qgc2V0dGluZ3NcbiAgICAgICAgICAgICAgICBJbmxpbmUuY29uZmlndXJlIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICB0cnlcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gSW5saW5lLnBhcnNlU2NhbGFyIHZhbHVlcy5rZXlcbiAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG5cbiAgICAgICAgICAgICAgICBpZiAnPDwnIGlzIGtleVxuICAgICAgICAgICAgICAgICAgICBtZXJnZU5vZGUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGFsbG93T3ZlcndyaXRlID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBpZiB2YWx1ZXMudmFsdWU/LmluZGV4T2YoJyonKSBpcyAwXG4gICAgICAgICAgICAgICAgICAgICAgICByZWZOYW1lID0gdmFsdWVzLnZhbHVlWzEuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBAcmVmc1tyZWZOYW1lXT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1JlZmVyZW5jZSBcIicrcmVmTmFtZSsnXCIgZG9lcyBub3QgZXhpc3QuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmVmFsdWUgPSBAcmVmc1tyZWZOYW1lXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB0eXBlb2YgcmVmVmFsdWUgaXNudCAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnWUFNTCBtZXJnZSBrZXlzIHVzZWQgd2l0aCBhIHNjYWxhciB2YWx1ZSBpbnN0ZWFkIG9mIGFuIG9iamVjdC4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiByZWZWYWx1ZSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBhcnJheSB3aXRoIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB2YWx1ZSwgaSBpbiByZWZWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW1N0cmluZyhpKV0gPz0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE1lcmdlIG9iamVjdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiByZWZWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPz0gdmFsdWVcblxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWx1ZXMudmFsdWU/IGFuZCB2YWx1ZXMudmFsdWUgaXNudCAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWVzLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBAZ2V0TmV4dEVtYmVkQmxvY2soKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIgPSBuZXcgUGFyc2VyIGNcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlci5yZWZzID0gQHJlZnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlZCA9IHBhcnNlci5wYXJzZSB2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgdHlwZW9mIHBhcnNlZCBpcyAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnWUFNTCBtZXJnZSBrZXlzIHVzZWQgd2l0aCBhIHNjYWxhciB2YWx1ZSBpbnN0ZWFkIG9mIGFuIG9iamVjdC4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBwYXJzZWQgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgSWYgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgbWVyZ2Uga2V5IGlzIGEgc2VxdWVuY2UsIHRoZW4gdGhpcyBzZXF1ZW5jZSBpcyBleHBlY3RlZCB0byBjb250YWluIG1hcHBpbmcgbm9kZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGFuZCBlYWNoIG9mIHRoZXNlIG5vZGVzIGlzIG1lcmdlZCBpbiB0dXJuIGFjY29yZGluZyB0byBpdHMgb3JkZXIgaW4gdGhlIHNlcXVlbmNlLiBLZXlzIGluIG1hcHBpbmcgbm9kZXMgZWFybGllclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgaW4gdGhlIHNlcXVlbmNlIG92ZXJyaWRlIGtleXMgc3BlY2lmaWVkIGluIGxhdGVyIG1hcHBpbmcgbm9kZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHBhcnNlZEl0ZW0gaW4gcGFyc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyB0eXBlb2YgcGFyc2VkSXRlbSBpcyAnb2JqZWN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdNZXJnZSBpdGVtcyBtdXN0IGJlIG9iamVjdHMuJywgQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxLCBwYXJzZWRJdGVtXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgcGFyc2VkSXRlbSBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE1lcmdlIGFycmF5IHdpdGggb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgdmFsdWUsIGkgaW4gcGFyc2VkSXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGsgPSBTdHJpbmcoaSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmxlc3MgZGF0YS5oYXNPd25Qcm9wZXJ0eShrKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tdID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBNZXJnZSBvYmplY3RzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Iga2V5LCB2YWx1ZSBvZiBwYXJzZWRJdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIGRhdGEuaGFzT3duUHJvcGVydHkoa2V5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWx1ZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBJZiB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBrZXkgaXMgYSBzaW5nbGUgbWFwcGluZyBub2RlLCBlYWNoIG9mIGl0cyBrZXkvdmFsdWUgcGFpcnMgaXMgaW5zZXJ0ZWQgaW50byB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIGN1cnJlbnQgbWFwcGluZywgdW5sZXNzIHRoZSBrZXkgYWxyZWFkeSBleGlzdHMgaW4gaXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGtleSwgdmFsdWUgb2YgcGFyc2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVubGVzcyBkYXRhLmhhc093blByb3BlcnR5KGtleSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlXG5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIHZhbHVlcy52YWx1ZT8gYW5kIG1hdGNoZXMgPSBAUEFUVEVSTl9BTkNIT1JfVkFMVUUuZXhlYyB2YWx1ZXMudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaXNSZWYgPSBtYXRjaGVzLnJlZlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXMudmFsdWUgPSBtYXRjaGVzLnZhbHVlXG5cblxuICAgICAgICAgICAgICAgIGlmIG1lcmdlTm9kZVxuICAgICAgICAgICAgICAgICAgICAjIE1lcmdlIGtleXNcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG5vdCh2YWx1ZXMudmFsdWU/KSBvciAnJyBpcyBVdGlscy50cmltKHZhbHVlcy52YWx1ZSwgJyAnKSBvciBVdGlscy5sdHJpbSh2YWx1ZXMudmFsdWUsICcgJykuaW5kZXhPZignIycpIGlzIDBcbiAgICAgICAgICAgICAgICAgICAgIyBIYXNoXG4gICAgICAgICAgICAgICAgICAgICMgaWYgbmV4dCBsaW5lIGlzIGxlc3MgaW5kZW50ZWQgb3IgZXF1YWwsIHRoZW4gaXQgbWVhbnMgdGhhdCB0aGUgY3VycmVudCB2YWx1ZSBpcyBudWxsXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdChAaXNOZXh0TGluZUluZGVudGVkKCkpIGFuZCBub3QoQGlzTmV4dExpbmVVbkluZGVudGVkQ29sbGVjdGlvbigpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBTcGVjOiBLZXlzIE1VU1QgYmUgdW5pcXVlOyBmaXJzdCBvbmUgd2lucy5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgQnV0IG92ZXJ3cml0aW5nIGlzIGFsbG93ZWQgd2hlbiBhIG1lcmdlIG5vZGUgaXMgdXNlZCBpbiBjdXJyZW50IGJsb2NrLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgYWxsb3dPdmVyd3JpdGUgb3IgZGF0YVtrZXldIGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IG51bGxcblxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJzZXIgPSBuZXcgUGFyc2VyIGNcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlci5yZWZzID0gQHJlZnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbCA9IHBhcnNlci5wYXJzZSBAZ2V0TmV4dEVtYmVkQmxvY2soKSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIFNwZWM6IEtleXMgTVVTVCBiZSB1bmlxdWU7IGZpcnN0IG9uZSB3aW5zLlxuICAgICAgICAgICAgICAgICAgICAgICAgIyBCdXQgb3ZlcndyaXRpbmcgaXMgYWxsb3dlZCB3aGVuIGEgbWVyZ2Ugbm9kZSBpcyB1c2VkIGluIGN1cnJlbnQgYmxvY2suXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBhbGxvd092ZXJ3cml0ZSBvciBkYXRhW2tleV0gaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsXG5cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHZhbCA9IEBwYXJzZVZhbHVlIHZhbHVlcy52YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG4gICAgICAgICAgICAgICAgICAgICMgU3BlYzogS2V5cyBNVVNUIGJlIHVuaXF1ZTsgZmlyc3Qgb25lIHdpbnMuXG4gICAgICAgICAgICAgICAgICAgICMgQnV0IG92ZXJ3cml0aW5nIGlzIGFsbG93ZWQgd2hlbiBhIG1lcmdlIG5vZGUgaXMgdXNlZCBpbiBjdXJyZW50IGJsb2NrLlxuICAgICAgICAgICAgICAgICAgICBpZiBhbGxvd092ZXJ3cml0ZSBvciBkYXRhW2tleV0gaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB2YWxcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgMS1saW5lciBvcHRpb25hbGx5IGZvbGxvd2VkIGJ5IG5ld2xpbmVcbiAgICAgICAgICAgICAgICBsaW5lQ291bnQgPSBAbGluZXMubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgMSBpcyBsaW5lQ291bnQgb3IgKDIgaXMgbGluZUNvdW50IGFuZCBVdGlscy5pc0VtcHR5KEBsaW5lc1sxXSkpXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBJbmxpbmUucGFyc2UgQGxpbmVzWzBdLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucGFyc2VkTGluZSA9IEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5zbmlwcGV0ID0gQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVcblxuICAgICAgICAgICAgICAgICAgICBpZiB0eXBlb2YgdmFsdWUgaXMgJ29iamVjdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdCA9IHZhbHVlWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGtleSBvZiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdCA9IHZhbHVlW2tleV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHlwZW9mIGZpcnN0IGlzICdzdHJpbmcnIGFuZCBmaXJzdC5pbmRleE9mKCcqJykgaXMgMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEgPSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBhbGlhcyBpbiB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2ggQHJlZnNbYWxpYXNbMS4uXV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGFcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWVcblxuICAgICAgICAgICAgICAgIGVsc2UgaWYgVXRpbHMubHRyaW0odmFsdWUpLmNoYXJBdCgwKSBpbiBbJ1snLCAneyddXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIElubGluZS5wYXJzZSB2YWx1ZSwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuICAgICAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnBhcnNlZExpbmUgPSBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGUuc25pcHBldCA9IEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlXG5cbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUGFyc2VFeGNlcHRpb24gJ1VuYWJsZSB0byBwYXJzZS4nLCBAZ2V0UmVhbEN1cnJlbnRMaW5lTmIoKSArIDEsIEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICBpZiBpc1JlZlxuICAgICAgICAgICAgICAgIGlmIGRhdGEgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgICAgICAgICBAcmVmc1tpc1JlZl0gPSBkYXRhW2RhdGEubGVuZ3RoLTFdXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsYXN0S2V5ID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICBmb3Iga2V5IG9mIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RLZXkgPSBrZXlcbiAgICAgICAgICAgICAgICAgICAgQHJlZnNbaXNSZWZdID0gZGF0YVtsYXN0S2V5XVxuXG5cbiAgICAgICAgaWYgVXRpbHMuaXNFbXB0eShkYXRhKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGRhdGFcblxuXG5cbiAgICAjIFJldHVybnMgdGhlIGN1cnJlbnQgbGluZSBudW1iZXIgKHRha2VzIHRoZSBvZmZzZXQgaW50byBhY2NvdW50KS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtJbnRlZ2VyXSAgICAgVGhlIGN1cnJlbnQgbGluZSBudW1iZXJcbiAgICAjXG4gICAgZ2V0UmVhbEN1cnJlbnRMaW5lTmI6IC0+XG4gICAgICAgIHJldHVybiBAY3VycmVudExpbmVOYiArIEBvZmZzZXRcblxuXG4gICAgIyBSZXR1cm5zIHRoZSBjdXJyZW50IGxpbmUgaW5kZW50YXRpb24uXG4gICAgI1xuICAgICMgQHJldHVybiBbSW50ZWdlcl0gICAgIFRoZSBjdXJyZW50IGxpbmUgaW5kZW50YXRpb25cbiAgICAjXG4gICAgZ2V0Q3VycmVudExpbmVJbmRlbnRhdGlvbjogLT5cbiAgICAgICAgcmV0dXJuIEBjdXJyZW50TGluZS5sZW5ndGggLSBVdGlscy5sdHJpbShAY3VycmVudExpbmUsICcgJykubGVuZ3RoXG5cblxuICAgICMgUmV0dXJucyB0aGUgbmV4dCBlbWJlZCBibG9jayBvZiBZQU1MLlxuICAgICNcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gICAgICAgICAgaW5kZW50YXRpb24gVGhlIGluZGVudCBsZXZlbCBhdCB3aGljaCB0aGUgYmxvY2sgaXMgdG8gYmUgcmVhZCwgb3IgbnVsbCBmb3IgZGVmYXVsdFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICAgICAgQSBZQU1MIHN0cmluZ1xuICAgICNcbiAgICAjIEB0aHJvdyBbUGFyc2VFeGNlcHRpb25dICAgV2hlbiBpbmRlbnRhdGlvbiBwcm9ibGVtIGFyZSBkZXRlY3RlZFxuICAgICNcbiAgICBnZXROZXh0RW1iZWRCbG9jazogKGluZGVudGF0aW9uID0gbnVsbCwgaW5jbHVkZVVuaW5kZW50ZWRDb2xsZWN0aW9uID0gZmFsc2UpIC0+XG4gICAgICAgIEBtb3ZlVG9OZXh0TGluZSgpXG5cbiAgICAgICAgaWYgbm90IGluZGVudGF0aW9uP1xuICAgICAgICAgICAgbmV3SW5kZW50ID0gQGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb24oKVxuXG4gICAgICAgICAgICB1bmluZGVudGVkRW1iZWRCbG9jayA9IEBpc1N0cmluZ1VuSW5kZW50ZWRDb2xsZWN0aW9uSXRlbSBAY3VycmVudExpbmVcblxuICAgICAgICAgICAgaWYgbm90KEBpc0N1cnJlbnRMaW5lRW1wdHkoKSkgYW5kIDAgaXMgbmV3SW5kZW50IGFuZCBub3QodW5pbmRlbnRlZEVtYmVkQmxvY2spXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdJbmRlbnRhdGlvbiBwcm9ibGVtLicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbmV3SW5kZW50ID0gaW5kZW50YXRpb25cblxuXG4gICAgICAgIGRhdGEgPSBbQGN1cnJlbnRMaW5lW25ld0luZGVudC4uXV1cblxuICAgICAgICB1bmxlc3MgaW5jbHVkZVVuaW5kZW50ZWRDb2xsZWN0aW9uXG4gICAgICAgICAgICBpc0l0VW5pbmRlbnRlZENvbGxlY3Rpb24gPSBAaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW0gQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgIyBDb21tZW50cyBtdXN0IG5vdCBiZSByZW1vdmVkIGluc2lkZSBhIHN0cmluZyBibG9jayAoaWUuIGFmdGVyIGEgbGluZSBlbmRpbmcgd2l0aCBcInxcIilcbiAgICAgICAgIyBUaGV5IG11c3Qgbm90IGJlIHJlbW92ZWQgaW5zaWRlIGEgc3ViLWVtYmVkZGVkIGJsb2NrIGFzIHdlbGxcbiAgICAgICAgcmVtb3ZlQ29tbWVudHNQYXR0ZXJuID0gQFBBVFRFUk5fRk9MREVEX1NDQUxBUl9FTkRcbiAgICAgICAgcmVtb3ZlQ29tbWVudHMgPSBub3QgcmVtb3ZlQ29tbWVudHNQYXR0ZXJuLnRlc3QgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgd2hpbGUgQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgICAgIGluZGVudCA9IEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKClcblxuICAgICAgICAgICAgaWYgaW5kZW50IGlzIG5ld0luZGVudFxuICAgICAgICAgICAgICAgIHJlbW92ZUNvbW1lbnRzID0gbm90IHJlbW92ZUNvbW1lbnRzUGF0dGVybi50ZXN0IEBjdXJyZW50TGluZVxuXG4gICAgICAgICAgICBpZiByZW1vdmVDb21tZW50cyBhbmQgQGlzQ3VycmVudExpbmVDb21tZW50KClcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpZiBAaXNDdXJyZW50TGluZUJsYW5rKClcbiAgICAgICAgICAgICAgICBkYXRhLnB1c2ggQGN1cnJlbnRMaW5lW25ld0luZGVudC4uXVxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlmIGlzSXRVbmluZGVudGVkQ29sbGVjdGlvbiBhbmQgbm90IEBpc1N0cmluZ1VuSW5kZW50ZWRDb2xsZWN0aW9uSXRlbShAY3VycmVudExpbmUpIGFuZCBpbmRlbnQgaXMgbmV3SW5kZW50XG4gICAgICAgICAgICAgICAgQG1vdmVUb1ByZXZpb3VzTGluZSgpXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgaWYgaW5kZW50ID49IG5ld0luZGVudFxuICAgICAgICAgICAgICAgIGRhdGEucHVzaCBAY3VycmVudExpbmVbbmV3SW5kZW50Li5dXG4gICAgICAgICAgICBlbHNlIGlmIFV0aWxzLmx0cmltKEBjdXJyZW50TGluZSkuY2hhckF0KDApIGlzICcjJ1xuICAgICAgICAgICAgICAgICMgRG9uJ3QgYWRkIGxpbmUgd2l0aCBjb21tZW50c1xuICAgICAgICAgICAgZWxzZSBpZiAwIGlzIGluZGVudFxuICAgICAgICAgICAgICAgIEBtb3ZlVG9QcmV2aW91c0xpbmUoKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXhjZXB0aW9uICdJbmRlbnRhdGlvbiBwcm9ibGVtLicsIEBnZXRSZWFsQ3VycmVudExpbmVOYigpICsgMSwgQGN1cnJlbnRMaW5lXG5cblxuICAgICAgICByZXR1cm4gZGF0YS5qb2luIFwiXFxuXCJcblxuXG4gICAgIyBNb3ZlcyB0aGUgcGFyc2VyIHRvIHRoZSBuZXh0IGxpbmUuXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl1cbiAgICAjXG4gICAgbW92ZVRvTmV4dExpbmU6IC0+XG4gICAgICAgIGlmIEBjdXJyZW50TGluZU5iID49IEBsaW5lcy5sZW5ndGggLSAxXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICBAY3VycmVudExpbmUgPSBAbGluZXNbKytAY3VycmVudExpbmVOYl07XG5cbiAgICAgICAgcmV0dXJuIHRydWVcblxuXG4gICAgIyBNb3ZlcyB0aGUgcGFyc2VyIHRvIHRoZSBwcmV2aW91cyBsaW5lLlxuICAgICNcbiAgICBtb3ZlVG9QcmV2aW91c0xpbmU6IC0+XG4gICAgICAgIEBjdXJyZW50TGluZSA9IEBsaW5lc1stLUBjdXJyZW50TGluZU5iXVxuICAgICAgICByZXR1cm5cblxuXG4gICAgIyBQYXJzZXMgYSBZQU1MIHZhbHVlLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlICAgICAgICAgICAgICAgICAgIEEgWUFNTCB2YWx1ZVxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyBmYWxzZSBvdGhlcndpc2VcbiAgICAjIEBwYXJhbSBbRnVuY3Rpb25dIG9iamVjdERlY29kZXIgICAgICAgICAgIEEgZnVuY3Rpb24gdG8gZGVzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbT2JqZWN0XSBBIEphdmFTY3JpcHQgdmFsdWVcbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBXaGVuIHJlZmVyZW5jZSBkb2VzIG5vdCBleGlzdFxuICAgICNcbiAgICBwYXJzZVZhbHVlOiAodmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXIpIC0+XG4gICAgICAgIGlmIDAgaXMgdmFsdWUuaW5kZXhPZignKicpXG4gICAgICAgICAgICBwb3MgPSB2YWx1ZS5pbmRleE9mICcjJ1xuICAgICAgICAgICAgaWYgcG9zIGlzbnQgLTFcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnN1YnN0cigxLCBwb3MtMilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlWzEuLl1cblxuICAgICAgICAgICAgaWYgQHJlZnNbdmFsdWVdIGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBQYXJzZUV4Y2VwdGlvbiAnUmVmZXJlbmNlIFwiJyt2YWx1ZSsnXCIgZG9lcyBub3QgZXhpc3QuJywgQGN1cnJlbnRMaW5lXG5cbiAgICAgICAgICAgIHJldHVybiBAcmVmc1t2YWx1ZV1cblxuXG4gICAgICAgIGlmIG1hdGNoZXMgPSBAUEFUVEVSTl9GT0xERURfU0NBTEFSX0FMTC5leGVjIHZhbHVlXG4gICAgICAgICAgICBtb2RpZmllcnMgPSBtYXRjaGVzLm1vZGlmaWVycyA/ICcnXG5cbiAgICAgICAgICAgIGZvbGRlZEluZGVudCA9IE1hdGguYWJzKHBhcnNlSW50KG1vZGlmaWVycykpXG4gICAgICAgICAgICBpZiBpc05hTihmb2xkZWRJbmRlbnQpIHRoZW4gZm9sZGVkSW5kZW50ID0gMFxuICAgICAgICAgICAgdmFsID0gQHBhcnNlRm9sZGVkU2NhbGFyIG1hdGNoZXMuc2VwYXJhdG9yLCBAUEFUVEVSTl9ERUNJTUFMLnJlcGxhY2UobW9kaWZpZXJzLCAnJyksIGZvbGRlZEluZGVudFxuICAgICAgICAgICAgaWYgbWF0Y2hlcy50eXBlP1xuICAgICAgICAgICAgICAgICMgRm9yY2UgY29ycmVjdCBzZXR0aW5nc1xuICAgICAgICAgICAgICAgIElubGluZS5jb25maWd1cmUgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuICAgICAgICAgICAgICAgIHJldHVybiBJbmxpbmUucGFyc2VTY2FsYXIgbWF0Y2hlcy50eXBlKycgJyt2YWxcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsXG5cbiAgICAgICAgIyBWYWx1ZSBjYW4gYmUgbXVsdGlsaW5lIGNvbXBhY3Qgc2VxdWVuY2Ugb3IgbWFwcGluZyBvciBzdHJpbmdcbiAgICAgICAgaWYgdmFsdWUuY2hhckF0KDApIGluIFsnWycsICd7JywgJ1wiJywgXCInXCJdXG4gICAgICAgICAgICB3aGlsZSB0cnVlXG4gICAgICAgICAgICAgICAgdHJ5XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBJbmxpbmUucGFyc2UgdmFsdWUsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICBjYXRjaCBlXG4gICAgICAgICAgICAgICAgICAgIGlmIGUgaW5zdGFuY2VvZiBQYXJzZU1vcmUgYW5kIEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSArPSBcIlxcblwiICsgVXRpbHMudHJpbShAY3VycmVudExpbmUsICcgJylcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wYXJzZWRMaW5lID0gQGdldFJlYWxDdXJyZW50TGluZU5iKCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICBlLnNuaXBwZXQgPSBAY3VycmVudExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgaWYgQGlzTmV4dExpbmVJbmRlbnRlZCgpXG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gXCJcXG5cIiArIEBnZXROZXh0RW1iZWRCbG9jaygpXG4gICAgICAgICAgICByZXR1cm4gSW5saW5lLnBhcnNlIHZhbHVlLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyXG5cbiAgICAgICAgcmV0dXJuXG5cblxuICAgICMgUGFyc2VzIGEgZm9sZGVkIHNjYWxhci5cbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICAgICAgc2VwYXJhdG9yICAgVGhlIHNlcGFyYXRvciB0aGF0IHdhcyB1c2VkIHRvIGJlZ2luIHRoaXMgZm9sZGVkIHNjYWxhciAofCBvciA+KVxuICAgICMgQHBhcmFtIFtTdHJpbmddICAgICAgIGluZGljYXRvciAgIFRoZSBpbmRpY2F0b3IgdGhhdCB3YXMgdXNlZCB0byBiZWdpbiB0aGlzIGZvbGRlZCBzY2FsYXIgKCsgb3IgLSlcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gICAgICBpbmRlbnRhdGlvbiBUaGUgaW5kZW50YXRpb24gdGhhdCB3YXMgdXNlZCB0byBiZWdpbiB0aGlzIGZvbGRlZCBzY2FsYXJcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddICAgICAgVGhlIHRleHQgdmFsdWVcbiAgICAjXG4gICAgcGFyc2VGb2xkZWRTY2FsYXI6IChzZXBhcmF0b3IsIGluZGljYXRvciA9ICcnLCBpbmRlbnRhdGlvbiA9IDApIC0+XG4gICAgICAgIG5vdEVPRiA9IEBtb3ZlVG9OZXh0TGluZSgpXG4gICAgICAgIGlmIG5vdCBub3RFT0ZcbiAgICAgICAgICAgIHJldHVybiAnJ1xuXG4gICAgICAgIGlzQ3VycmVudExpbmVCbGFuayA9IEBpc0N1cnJlbnRMaW5lQmxhbmsoKVxuICAgICAgICB0ZXh0ID0gJydcblxuICAgICAgICAjIExlYWRpbmcgYmxhbmsgbGluZXMgYXJlIGNvbnN1bWVkIGJlZm9yZSBkZXRlcm1pbmluZyBpbmRlbnRhdGlvblxuICAgICAgICB3aGlsZSBub3RFT0YgYW5kIGlzQ3VycmVudExpbmVCbGFua1xuICAgICAgICAgICAgIyBuZXdsaW5lIG9ubHkgaWYgbm90IEVPRlxuICAgICAgICAgICAgaWYgbm90RU9GID0gQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgICAgICAgICB0ZXh0ICs9IFwiXFxuXCJcbiAgICAgICAgICAgICAgICBpc0N1cnJlbnRMaW5lQmxhbmsgPSBAaXNDdXJyZW50TGluZUJsYW5rKClcblxuXG4gICAgICAgICMgRGV0ZXJtaW5lIGluZGVudGF0aW9uIGlmIG5vdCBzcGVjaWZpZWRcbiAgICAgICAgaWYgMCBpcyBpbmRlbnRhdGlvblxuICAgICAgICAgICAgaWYgbWF0Y2hlcyA9IEBQQVRURVJOX0lOREVOVF9TUEFDRVMuZXhlYyBAY3VycmVudExpbmVcbiAgICAgICAgICAgICAgICBpbmRlbnRhdGlvbiA9IG1hdGNoZXNbMF0ubGVuZ3RoXG5cblxuICAgICAgICBpZiBpbmRlbnRhdGlvbiA+IDBcbiAgICAgICAgICAgIHBhdHRlcm4gPSBAUEFUVEVSTl9GT0xERURfU0NBTEFSX0JZX0lOREVOVEFUSU9OW2luZGVudGF0aW9uXVxuICAgICAgICAgICAgdW5sZXNzIHBhdHRlcm4/XG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IG5ldyBQYXR0ZXJuICdeIHsnK2luZGVudGF0aW9uKyd9KC4qKSQnXG4gICAgICAgICAgICAgICAgUGFyc2VyOjpQQVRURVJOX0ZPTERFRF9TQ0FMQVJfQllfSU5ERU5UQVRJT05baW5kZW50YXRpb25dID0gcGF0dGVyblxuXG4gICAgICAgICAgICB3aGlsZSBub3RFT0YgYW5kIChpc0N1cnJlbnRMaW5lQmxhbmsgb3IgbWF0Y2hlcyA9IHBhdHRlcm4uZXhlYyBAY3VycmVudExpbmUpXG4gICAgICAgICAgICAgICAgaWYgaXNDdXJyZW50TGluZUJsYW5rXG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gQGN1cnJlbnRMaW5lW2luZGVudGF0aW9uLi5dXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IG1hdGNoZXNbMV1cblxuICAgICAgICAgICAgICAgICMgbmV3bGluZSBvbmx5IGlmIG5vdCBFT0ZcbiAgICAgICAgICAgICAgICBpZiBub3RFT0YgPSBAbW92ZVRvTmV4dExpbmUoKVxuICAgICAgICAgICAgICAgICAgICB0ZXh0ICs9IFwiXFxuXCJcbiAgICAgICAgICAgICAgICAgICAgaXNDdXJyZW50TGluZUJsYW5rID0gQGlzQ3VycmVudExpbmVCbGFuaygpXG5cbiAgICAgICAgZWxzZSBpZiBub3RFT0ZcbiAgICAgICAgICAgIHRleHQgKz0gXCJcXG5cIlxuXG5cbiAgICAgICAgaWYgbm90RU9GXG4gICAgICAgICAgICBAbW92ZVRvUHJldmlvdXNMaW5lKClcblxuXG4gICAgICAgICMgUmVtb3ZlIGxpbmUgYnJlYWtzIG9mIGVhY2ggbGluZXMgZXhjZXB0IHRoZSBlbXB0eSBhbmQgbW9yZSBpbmRlbnRlZCBvbmVzXG4gICAgICAgIGlmICc+JyBpcyBzZXBhcmF0b3JcbiAgICAgICAgICAgIG5ld1RleHQgPSAnJ1xuICAgICAgICAgICAgZm9yIGxpbmUgaW4gdGV4dC5zcGxpdCBcIlxcblwiXG4gICAgICAgICAgICAgICAgaWYgbGluZS5sZW5ndGggaXMgMCBvciBsaW5lLmNoYXJBdCgwKSBpcyAnICdcbiAgICAgICAgICAgICAgICAgICAgbmV3VGV4dCA9IFV0aWxzLnJ0cmltKG5ld1RleHQsICcgJykgKyBsaW5lICsgXCJcXG5cIlxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbmV3VGV4dCArPSBsaW5lICsgJyAnXG4gICAgICAgICAgICB0ZXh0ID0gbmV3VGV4dFxuXG4gICAgICAgIGlmICcrJyBpc250IGluZGljYXRvclxuICAgICAgICAgICAgIyBSZW1vdmUgYW55IGV4dHJhIHNwYWNlIG9yIG5ldyBsaW5lIGFzIHdlIGFyZSBhZGRpbmcgdGhlbSBhZnRlclxuICAgICAgICAgICAgdGV4dCA9IFV0aWxzLnJ0cmltKHRleHQpXG5cbiAgICAgICAgIyBEZWFsIHdpdGggdHJhaWxpbmcgbmV3bGluZXMgYXMgaW5kaWNhdGVkXG4gICAgICAgIGlmICcnIGlzIGluZGljYXRvclxuICAgICAgICAgICAgdGV4dCA9IEBQQVRURVJOX1RSQUlMSU5HX0xJTkVTLnJlcGxhY2UgdGV4dCwgXCJcXG5cIlxuICAgICAgICBlbHNlIGlmICctJyBpcyBpbmRpY2F0b3JcbiAgICAgICAgICAgIHRleHQgPSBAUEFUVEVSTl9UUkFJTElOR19MSU5FUy5yZXBsYWNlIHRleHQsICcnXG5cbiAgICAgICAgcmV0dXJuIHRleHRcblxuXG4gICAgIyBSZXR1cm5zIHRydWUgaWYgdGhlIG5leHQgbGluZSBpcyBpbmRlbnRlZC5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSAgICAgUmV0dXJucyB0cnVlIGlmIHRoZSBuZXh0IGxpbmUgaXMgaW5kZW50ZWQsIGZhbHNlIG90aGVyd2lzZVxuICAgICNcbiAgICBpc05leHRMaW5lSW5kZW50ZWQ6IChpZ25vcmVDb21tZW50cyA9IHRydWUpIC0+XG4gICAgICAgIGN1cnJlbnRJbmRlbnRhdGlvbiA9IEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKClcbiAgICAgICAgRU9GID0gbm90IEBtb3ZlVG9OZXh0TGluZSgpXG5cbiAgICAgICAgaWYgaWdub3JlQ29tbWVudHNcbiAgICAgICAgICAgIHdoaWxlIG5vdChFT0YpIGFuZCBAaXNDdXJyZW50TGluZUVtcHR5KClcbiAgICAgICAgICAgICAgICBFT0YgPSBub3QgQG1vdmVUb05leHRMaW5lKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgd2hpbGUgbm90KEVPRikgYW5kIEBpc0N1cnJlbnRMaW5lQmxhbmsoKVxuICAgICAgICAgICAgICAgIEVPRiA9IG5vdCBAbW92ZVRvTmV4dExpbmUoKVxuXG4gICAgICAgIGlmIEVPRlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgcmV0ID0gZmFsc2VcbiAgICAgICAgaWYgQGdldEN1cnJlbnRMaW5lSW5kZW50YXRpb24oKSA+IGN1cnJlbnRJbmRlbnRhdGlvblxuICAgICAgICAgICAgcmV0ID0gdHJ1ZVxuXG4gICAgICAgIEBtb3ZlVG9QcmV2aW91c0xpbmUoKVxuXG4gICAgICAgIHJldHVybiByZXRcblxuXG4gICAgIyBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgbGluZSBpcyBibGFuayBvciBpZiBpdCBpcyBhIGNvbW1lbnQgbGluZS5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSAgICAgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgZW1wdHkgb3IgaWYgaXQgaXMgYSBjb21tZW50IGxpbmUsIGZhbHNlIG90aGVyd2lzZVxuICAgICNcbiAgICBpc0N1cnJlbnRMaW5lRW1wdHk6IC0+XG4gICAgICAgIHRyaW1tZWRMaW5lID0gVXRpbHMudHJpbShAY3VycmVudExpbmUsICcgJylcbiAgICAgICAgcmV0dXJuIHRyaW1tZWRMaW5lLmxlbmd0aCBpcyAwIG9yIHRyaW1tZWRMaW5lLmNoYXJBdCgwKSBpcyAnIydcblxuXG4gICAgIyBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgbGluZSBpcyBibGFuay5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSAgICAgUmV0dXJucyB0cnVlIGlmIHRoZSBjdXJyZW50IGxpbmUgaXMgYmxhbmssIGZhbHNlIG90aGVyd2lzZVxuICAgICNcbiAgICBpc0N1cnJlbnRMaW5lQmxhbms6IC0+XG4gICAgICAgIHJldHVybiAnJyBpcyBVdGlscy50cmltKEBjdXJyZW50TGluZSwgJyAnKVxuXG5cbiAgICAjIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCBsaW5lIGlzIGEgY29tbWVudCBsaW5lLlxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgbGluZSBpcyBhIGNvbW1lbnQgbGluZSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgI1xuICAgIGlzQ3VycmVudExpbmVDb21tZW50OiAtPlxuICAgICAgICAjIENoZWNraW5nIGV4cGxpY2l0bHkgdGhlIGZpcnN0IGNoYXIgb2YgdGhlIHRyaW0gaXMgZmFzdGVyIHRoYW4gbG9vcHMgb3Igc3RycG9zXG4gICAgICAgIGx0cmltbWVkTGluZSA9IFV0aWxzLmx0cmltKEBjdXJyZW50TGluZSwgJyAnKVxuXG4gICAgICAgIHJldHVybiBsdHJpbW1lZExpbmUuY2hhckF0KDApIGlzICcjJ1xuXG5cbiAgICAjIENsZWFudXBzIGEgWUFNTCBzdHJpbmcgdG8gYmUgcGFyc2VkLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHZhbHVlIFRoZSBpbnB1dCBZQU1MIHN0cmluZ1xuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIEEgY2xlYW5lZCB1cCBZQU1MIHN0cmluZ1xuICAgICNcbiAgICBjbGVhbnVwOiAodmFsdWUpIC0+XG4gICAgICAgIGlmIHZhbHVlLmluZGV4T2YoXCJcXHJcIikgaXNudCAtMVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zcGxpdChcIlxcclxcblwiKS5qb2luKFwiXFxuXCIpLnNwbGl0KFwiXFxyXCIpLmpvaW4oXCJcXG5cIilcblxuICAgICAgICAjIFN0cmlwIFlBTUwgaGVhZGVyXG4gICAgICAgIGNvdW50ID0gMFxuICAgICAgICBbdmFsdWUsIGNvdW50XSA9IEBQQVRURVJOX1lBTUxfSEVBREVSLnJlcGxhY2VBbGwgdmFsdWUsICcnXG4gICAgICAgIEBvZmZzZXQgKz0gY291bnRcblxuICAgICAgICAjIFJlbW92ZSBsZWFkaW5nIGNvbW1lbnRzXG4gICAgICAgIFt0cmltbWVkVmFsdWUsIGNvdW50XSA9IEBQQVRURVJOX0xFQURJTkdfQ09NTUVOVFMucmVwbGFjZUFsbCB2YWx1ZSwgJycsIDFcbiAgICAgICAgaWYgY291bnQgaXMgMVxuICAgICAgICAgICAgIyBJdGVtcyBoYXZlIGJlZW4gcmVtb3ZlZCwgdXBkYXRlIHRoZSBvZmZzZXRcbiAgICAgICAgICAgIEBvZmZzZXQgKz0gVXRpbHMuc3ViU3RyQ291bnQodmFsdWUsIFwiXFxuXCIpIC0gVXRpbHMuc3ViU3RyQ291bnQodHJpbW1lZFZhbHVlLCBcIlxcblwiKVxuICAgICAgICAgICAgdmFsdWUgPSB0cmltbWVkVmFsdWVcblxuICAgICAgICAjIFJlbW92ZSBzdGFydCBvZiB0aGUgZG9jdW1lbnQgbWFya2VyICgtLS0pXG4gICAgICAgIFt0cmltbWVkVmFsdWUsIGNvdW50XSA9IEBQQVRURVJOX0RPQ1VNRU5UX01BUktFUl9TVEFSVC5yZXBsYWNlQWxsIHZhbHVlLCAnJywgMVxuICAgICAgICBpZiBjb3VudCBpcyAxXG4gICAgICAgICAgICAjIEl0ZW1zIGhhdmUgYmVlbiByZW1vdmVkLCB1cGRhdGUgdGhlIG9mZnNldFxuICAgICAgICAgICAgQG9mZnNldCArPSBVdGlscy5zdWJTdHJDb3VudCh2YWx1ZSwgXCJcXG5cIikgLSBVdGlscy5zdWJTdHJDb3VudCh0cmltbWVkVmFsdWUsIFwiXFxuXCIpXG4gICAgICAgICAgICB2YWx1ZSA9IHRyaW1tZWRWYWx1ZVxuXG4gICAgICAgICAgICAjIFJlbW92ZSBlbmQgb2YgdGhlIGRvY3VtZW50IG1hcmtlciAoLi4uKVxuICAgICAgICAgICAgdmFsdWUgPSBAUEFUVEVSTl9ET0NVTUVOVF9NQVJLRVJfRU5ELnJlcGxhY2UgdmFsdWUsICcnXG5cbiAgICAgICAgIyBFbnN1cmUgdGhlIGJsb2NrIGlzIG5vdCBpbmRlbnRlZFxuICAgICAgICBsaW5lcyA9IHZhbHVlLnNwbGl0KFwiXFxuXCIpXG4gICAgICAgIHNtYWxsZXN0SW5kZW50ID0gLTFcbiAgICAgICAgZm9yIGxpbmUgaW4gbGluZXNcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIFV0aWxzLnRyaW0obGluZSwgJyAnKS5sZW5ndGggPT0gMFxuICAgICAgICAgICAgaW5kZW50ID0gbGluZS5sZW5ndGggLSBVdGlscy5sdHJpbShsaW5lKS5sZW5ndGhcbiAgICAgICAgICAgIGlmIHNtYWxsZXN0SW5kZW50IGlzIC0xIG9yIGluZGVudCA8IHNtYWxsZXN0SW5kZW50XG4gICAgICAgICAgICAgICAgc21hbGxlc3RJbmRlbnQgPSBpbmRlbnRcbiAgICAgICAgaWYgc21hbGxlc3RJbmRlbnQgPiAwXG4gICAgICAgICAgICBmb3IgbGluZSwgaSBpbiBsaW5lc1xuICAgICAgICAgICAgICAgIGxpbmVzW2ldID0gbGluZVtzbWFsbGVzdEluZGVudC4uXVxuICAgICAgICAgICAgdmFsdWUgPSBsaW5lcy5qb2luKFwiXFxuXCIpXG5cbiAgICAgICAgcmV0dXJuIHZhbHVlXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIHRoZSBuZXh0IGxpbmUgc3RhcnRzIHVuaW5kZW50ZWQgY29sbGVjdGlvblxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dICAgICBSZXR1cm5zIHRydWUgaWYgdGhlIG5leHQgbGluZSBzdGFydHMgdW5pbmRlbnRlZCBjb2xsZWN0aW9uLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNOZXh0TGluZVVuSW5kZW50ZWRDb2xsZWN0aW9uOiAoY3VycmVudEluZGVudGF0aW9uID0gbnVsbCkgLT5cbiAgICAgICAgY3VycmVudEluZGVudGF0aW9uID89IEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKClcbiAgICAgICAgbm90RU9GID0gQG1vdmVUb05leHRMaW5lKClcblxuICAgICAgICB3aGlsZSBub3RFT0YgYW5kIEBpc0N1cnJlbnRMaW5lRW1wdHkoKVxuICAgICAgICAgICAgbm90RU9GID0gQG1vdmVUb05leHRMaW5lKClcblxuICAgICAgICBpZiBmYWxzZSBpcyBub3RFT0ZcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuXG4gICAgICAgIHJldCA9IGZhbHNlXG4gICAgICAgIGlmIEBnZXRDdXJyZW50TGluZUluZGVudGF0aW9uKCkgaXMgY3VycmVudEluZGVudGF0aW9uIGFuZCBAaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW0oQGN1cnJlbnRMaW5lKVxuICAgICAgICAgICAgcmV0ID0gdHJ1ZVxuXG4gICAgICAgIEBtb3ZlVG9QcmV2aW91c0xpbmUoKVxuXG4gICAgICAgIHJldHVybiByZXRcblxuXG4gICAgIyBSZXR1cm5zIHRydWUgaWYgdGhlIHN0cmluZyBpcyB1bi1pbmRlbnRlZCBjb2xsZWN0aW9uIGl0ZW1cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSAgICAgUmV0dXJucyB0cnVlIGlmIHRoZSBzdHJpbmcgaXMgdW4taW5kZW50ZWQgY29sbGVjdGlvbiBpdGVtLCBmYWxzZSBvdGhlcndpc2VcbiAgICAjXG4gICAgaXNTdHJpbmdVbkluZGVudGVkQ29sbGVjdGlvbkl0ZW06IC0+XG4gICAgICAgIHJldHVybiBAY3VycmVudExpbmUgaXMgJy0nIG9yIEBjdXJyZW50TGluZVswLi4uMl0gaXMgJy0gJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFyc2VyXG4iLCJcbiMgUGF0dGVybiBpcyBhIHplcm8tY29uZmxpY3Qgd3JhcHBlciBleHRlbmRpbmcgUmVnRXhwIGZlYXR1cmVzXG4jIGluIG9yZGVyIHRvIG1ha2UgWUFNTCBwYXJzaW5nIHJlZ2V4IG1vcmUgZXhwcmVzc2l2ZS5cbiNcbmNsYXNzIFBhdHRlcm5cblxuICAgICMgQHByb3BlcnR5IFtSZWdFeHBdIFRoZSBSZWdFeHAgaW5zdGFuY2VcbiAgICByZWdleDogICAgICAgICAgbnVsbFxuXG4gICAgIyBAcHJvcGVydHkgW1N0cmluZ10gVGhlIHJhdyByZWdleCBzdHJpbmdcbiAgICByYXdSZWdleDogICAgICAgbnVsbFxuXG4gICAgIyBAcHJvcGVydHkgW1N0cmluZ10gVGhlIGNsZWFuZWQgcmVnZXggc3RyaW5nICh1c2VkIHRvIGNyZWF0ZSB0aGUgUmVnRXhwIGluc3RhbmNlKVxuICAgIGNsZWFuZWRSZWdleDogICBudWxsXG5cbiAgICAjIEBwcm9wZXJ0eSBbT2JqZWN0XSBUaGUgZGljdGlvbmFyeSBtYXBwaW5nIG5hbWVzIHRvIGNhcHR1cmluZyBicmFja2V0IG51bWJlcnNcbiAgICBtYXBwaW5nOiAgICAgICAgbnVsbFxuXG4gICAgIyBDb25zdHJ1Y3RvclxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSByYXdSZWdleCBUaGUgcmF3IHJlZ2V4IHN0cmluZyBkZWZpbmluZyB0aGUgcGF0dGVyblxuICAgICNcbiAgICBjb25zdHJ1Y3RvcjogKHJhd1JlZ2V4LCBtb2RpZmllcnMgPSAnJykgLT5cbiAgICAgICAgY2xlYW5lZFJlZ2V4ID0gJydcbiAgICAgICAgbGVuID0gcmF3UmVnZXgubGVuZ3RoXG4gICAgICAgIG1hcHBpbmcgPSBudWxsXG5cbiAgICAgICAgIyBDbGVhbnVwIHJhdyByZWdleCBhbmQgY29tcHV0ZSBtYXBwaW5nXG4gICAgICAgIGNhcHR1cmluZ0JyYWNrZXROdW1iZXIgPSAwXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHdoaWxlIGkgPCBsZW5cbiAgICAgICAgICAgIF9jaGFyID0gcmF3UmVnZXguY2hhckF0KGkpXG4gICAgICAgICAgICBpZiBfY2hhciBpcyAnXFxcXCdcbiAgICAgICAgICAgICAgICAjIElnbm9yZSBuZXh0IGNoYXJhY3RlclxuICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSByYXdSZWdleFtpLi5pKzFdXG4gICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBlbHNlIGlmIF9jaGFyIGlzICcoJ1xuICAgICAgICAgICAgICAgICMgSW5jcmVhc2UgYnJhY2tldCBudW1iZXIsIG9ubHkgaWYgaXQgaXMgY2FwdHVyaW5nXG4gICAgICAgICAgICAgICAgaWYgaSA8IGxlbiAtIDJcbiAgICAgICAgICAgICAgICAgICAgcGFydCA9IHJhd1JlZ2V4W2kuLmkrMl1cbiAgICAgICAgICAgICAgICAgICAgaWYgcGFydCBpcyAnKD86J1xuICAgICAgICAgICAgICAgICAgICAgICAgIyBOb24tY2FwdHVyaW5nIGJyYWNrZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9IHBhcnRcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBwYXJ0IGlzICcoPzwnXG4gICAgICAgICAgICAgICAgICAgICAgICAjIENhcHR1cmluZyBicmFja2V0IHdpdGggcG9zc2libHkgYSBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXB0dXJpbmdCcmFja2V0TnVtYmVyKytcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgKz0gMlxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSBpICsgMSA8IGxlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YkNoYXIgPSByYXdSZWdleC5jaGFyQXQoaSArIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgc3ViQ2hhciBpcyAnPidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYW5lZFJlZ2V4ICs9ICcoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbmFtZS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIEFzc29jaWF0ZSBhIG5hbWUgd2l0aCBhIGNhcHR1cmluZyBicmFja2V0IG51bWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwcGluZyA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwcGluZ1tuYW1lXSA9IGNhcHR1cmluZ0JyYWNrZXROdW1iZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgKz0gc3ViQ2hhclxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFuZWRSZWdleCArPSBfY2hhclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FwdHVyaW5nQnJhY2tldE51bWJlcisrXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gX2NoYXJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjbGVhbmVkUmVnZXggKz0gX2NoYXJcblxuICAgICAgICAgICAgaSsrXG5cbiAgICAgICAgQHJhd1JlZ2V4ID0gcmF3UmVnZXhcbiAgICAgICAgQGNsZWFuZWRSZWdleCA9IGNsZWFuZWRSZWdleFxuICAgICAgICBAcmVnZXggPSBuZXcgUmVnRXhwIEBjbGVhbmVkUmVnZXgsICdnJyttb2RpZmllcnMucmVwbGFjZSgnZycsICcnKVxuICAgICAgICBAbWFwcGluZyA9IG1hcHBpbmdcblxuXG4gICAgIyBFeGVjdXRlcyB0aGUgcGF0dGVybidzIHJlZ2V4IGFuZCByZXR1cm5zIHRoZSBtYXRjaGluZyB2YWx1ZXNcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBzdHJpbmcgdG8gdXNlIHRvIGV4ZWN1dGUgdGhlIHBhdHRlcm5cbiAgICAjXG4gICAgIyBAcmV0dXJuIFtBcnJheV0gVGhlIG1hdGNoaW5nIHZhbHVlcyBleHRyYWN0ZWQgZnJvbSBjYXB0dXJpbmcgYnJhY2tldHMgb3IgbnVsbCBpZiBub3RoaW5nIG1hdGNoZWRcbiAgICAjXG4gICAgZXhlYzogKHN0cikgLT5cbiAgICAgICAgQHJlZ2V4Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgbWF0Y2hlcyA9IEByZWdleC5leGVjIHN0clxuXG4gICAgICAgIGlmIG5vdCBtYXRjaGVzP1xuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICBpZiBAbWFwcGluZz9cbiAgICAgICAgICAgIGZvciBuYW1lLCBpbmRleCBvZiBAbWFwcGluZ1xuICAgICAgICAgICAgICAgIG1hdGNoZXNbbmFtZV0gPSBtYXRjaGVzW2luZGV4XVxuXG4gICAgICAgIHJldHVybiBtYXRjaGVzXG5cblxuICAgICMgVGVzdHMgdGhlIHBhdHRlcm4ncyByZWdleFxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHN0cmluZyB0byB1c2UgdG8gdGVzdCB0aGUgcGF0dGVyblxuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dIHRydWUgaWYgdGhlIHN0cmluZyBtYXRjaGVkXG4gICAgI1xuICAgIHRlc3Q6IChzdHIpIC0+XG4gICAgICAgIEByZWdleC5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBAcmVnZXgudGVzdCBzdHJcblxuXG4gICAgIyBSZXBsYWNlcyBvY2N1cmVuY2VzIG1hdGNoaW5nIHdpdGggdGhlIHBhdHRlcm4ncyByZWdleCB3aXRoIHJlcGxhY2VtZW50XG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc291cmNlIHN0cmluZyB0byBwZXJmb3JtIHJlcGxhY2VtZW50c1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHJlcGxhY2VtZW50IFRoZSBzdHJpbmcgdG8gdXNlIGluIHBsYWNlIG9mIGVhY2ggcmVwbGFjZWQgb2NjdXJlbmNlLlxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gVGhlIHJlcGxhY2VkIHN0cmluZ1xuICAgICNcbiAgICByZXBsYWNlOiAoc3RyLCByZXBsYWNlbWVudCkgLT5cbiAgICAgICAgQHJlZ2V4Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlIEByZWdleCwgcmVwbGFjZW1lbnRcblxuXG4gICAgIyBSZXBsYWNlcyBvY2N1cmVuY2VzIG1hdGNoaW5nIHdpdGggdGhlIHBhdHRlcm4ncyByZWdleCB3aXRoIHJlcGxhY2VtZW50IGFuZFxuICAgICMgZ2V0IGJvdGggdGhlIHJlcGxhY2VkIHN0cmluZyBhbmQgdGhlIG51bWJlciBvZiByZXBsYWNlZCBvY2N1cmVuY2VzIGluIHRoZSBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc291cmNlIHN0cmluZyB0byBwZXJmb3JtIHJlcGxhY2VtZW50c1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHJlcGxhY2VtZW50IFRoZSBzdHJpbmcgdG8gdXNlIGluIHBsYWNlIG9mIGVhY2ggcmVwbGFjZWQgb2NjdXJlbmNlLlxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSBsaW1pdCBUaGUgbWF4aW11bSBudW1iZXIgb2Ygb2NjdXJlbmNlcyB0byByZXBsYWNlICgwIG1lYW5zIGluZmluaXRlIG51bWJlciBvZiBvY2N1cmVuY2VzKVxuICAgICNcbiAgICAjIEByZXR1cm4gW0FycmF5XSBBIGRlc3RydWN0dXJhYmxlIGFycmF5IGNvbnRhaW5pbmcgdGhlIHJlcGxhY2VkIHN0cmluZyBhbmQgdGhlIG51bWJlciBvZiByZXBsYWNlZCBvY2N1cmVuY2VzLiBGb3IgaW5zdGFuY2U6IFtcIm15IHJlcGxhY2VkIHN0cmluZ1wiLCAyXVxuICAgICNcbiAgICByZXBsYWNlQWxsOiAoc3RyLCByZXBsYWNlbWVudCwgbGltaXQgPSAwKSAtPlxuICAgICAgICBAcmVnZXgubGFzdEluZGV4ID0gMFxuICAgICAgICBjb3VudCA9IDBcbiAgICAgICAgd2hpbGUgQHJlZ2V4LnRlc3Qoc3RyKSBhbmQgKGxpbWl0IGlzIDAgb3IgY291bnQgPCBsaW1pdClcbiAgICAgICAgICAgIEByZWdleC5sYXN0SW5kZXggPSAwXG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSBAcmVnZXgsIHJlcGxhY2VtZW50XG4gICAgICAgICAgICBjb3VudCsrXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW3N0ciwgY291bnRdXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQYXR0ZXJuXG5cbiIsIlxuVXRpbHMgICA9IHJlcXVpcmUgJy4vVXRpbHMnXG5QYXR0ZXJuID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuXG4jIFVuZXNjYXBlciBlbmNhcHN1bGF0ZXMgdW5lc2NhcGluZyBydWxlcyBmb3Igc2luZ2xlIGFuZCBkb3VibGUtcXVvdGVkIFlBTUwgc3RyaW5ncy5cbiNcbmNsYXNzIFVuZXNjYXBlclxuXG4gICAgIyBSZWdleCBmcmFnbWVudCB0aGF0IG1hdGNoZXMgYW4gZXNjYXBlZCBjaGFyYWN0ZXIgaW5cbiAgICAjIGEgZG91YmxlIHF1b3RlZCBzdHJpbmcuXG4gICAgQFBBVFRFUk5fRVNDQVBFRF9DSEFSQUNURVI6ICAgICBuZXcgUGF0dGVybiAnXFxcXFxcXFwoWzBhYnRcXHRudmZyZSBcIlxcXFwvXFxcXFxcXFxOX0xQXXx4WzAtOWEtZkEtRl17Mn18dVswLTlhLWZBLUZdezR9fFVbMC05YS1mQS1GXXs4fSknO1xuXG5cbiAgICAjIFVuZXNjYXBlcyBhIHNpbmdsZSBxdW90ZWQgc3RyaW5nLlxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgICAgICB2YWx1ZSBBIHNpbmdsZSBxdW90ZWQgc3RyaW5nLlxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gICAgICBUaGUgdW5lc2NhcGVkIHN0cmluZy5cbiAgICAjXG4gICAgQHVuZXNjYXBlU2luZ2xlUXVvdGVkU3RyaW5nOiAodmFsdWUpIC0+XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9cXCdcXCcvZywgJ1xcJycpXG5cblxuICAgICMgVW5lc2NhcGVzIGEgZG91YmxlIHF1b3RlZCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgICAgIHZhbHVlIEEgZG91YmxlIHF1b3RlZCBzdHJpbmcuXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgICAgIFRoZSB1bmVzY2FwZWQgc3RyaW5nLlxuICAgICNcbiAgICBAdW5lc2NhcGVEb3VibGVRdW90ZWRTdHJpbmc6ICh2YWx1ZSkgLT5cbiAgICAgICAgQF91bmVzY2FwZUNhbGxiYWNrID89IChzdHIpID0+XG4gICAgICAgICAgICByZXR1cm4gQHVuZXNjYXBlQ2hhcmFjdGVyKHN0cilcblxuICAgICAgICAjIEV2YWx1YXRlIHRoZSBzdHJpbmdcbiAgICAgICAgcmV0dXJuIEBQQVRURVJOX0VTQ0FQRURfQ0hBUkFDVEVSLnJlcGxhY2UgdmFsdWUsIEBfdW5lc2NhcGVDYWxsYmFja1xuXG5cbiAgICAjIFVuZXNjYXBlcyBhIGNoYXJhY3RlciB0aGF0IHdhcyBmb3VuZCBpbiBhIGRvdWJsZS1xdW90ZWQgc3RyaW5nXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddICAgICAgIHZhbHVlIEFuIGVzY2FwZWQgY2hhcmFjdGVyXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgICAgIFRoZSB1bmVzY2FwZWQgY2hhcmFjdGVyXG4gICAgI1xuICAgIEB1bmVzY2FwZUNoYXJhY3RlcjogKHZhbHVlKSAtPlxuICAgICAgICBjaCA9IFN0cmluZy5mcm9tQ2hhckNvZGVcbiAgICAgICAgc3dpdGNoIHZhbHVlLmNoYXJBdCgxKVxuICAgICAgICAgICAgd2hlbiAnMCdcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMClcbiAgICAgICAgICAgIHdoZW4gJ2EnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDcpXG4gICAgICAgICAgICB3aGVuICdiJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCg4KVxuICAgICAgICAgICAgd2hlbiAndCdcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcXHRcIlxuICAgICAgICAgICAgd2hlbiBcIlxcdFwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXFx0XCJcbiAgICAgICAgICAgIHdoZW4gJ24nXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiXFxuXCJcbiAgICAgICAgICAgIHdoZW4gJ3YnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDExKVxuICAgICAgICAgICAgd2hlbiAnZidcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMTIpXG4gICAgICAgICAgICB3aGVuICdyJ1xuICAgICAgICAgICAgICAgIHJldHVybiBjaCgxMylcbiAgICAgICAgICAgIHdoZW4gJ2UnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDI3KVxuICAgICAgICAgICAgd2hlbiAnICdcbiAgICAgICAgICAgICAgICByZXR1cm4gJyAnXG4gICAgICAgICAgICB3aGVuICdcIidcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1wiJ1xuICAgICAgICAgICAgd2hlbiAnLydcbiAgICAgICAgICAgICAgICByZXR1cm4gJy8nXG4gICAgICAgICAgICB3aGVuICdcXFxcJ1xuICAgICAgICAgICAgICAgIHJldHVybiAnXFxcXCdcbiAgICAgICAgICAgIHdoZW4gJ04nXG4gICAgICAgICAgICAgICAgIyBVKzAwODUgTkVYVCBMSU5FXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoKDB4MDA4NSlcbiAgICAgICAgICAgIHdoZW4gJ18nXG4gICAgICAgICAgICAgICAgIyBVKzAwQTAgTk8tQlJFQUsgU1BBQ0VcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMHgwMEEwKVxuICAgICAgICAgICAgd2hlbiAnTCdcbiAgICAgICAgICAgICAgICAjIFUrMjAyOCBMSU5FIFNFUEFSQVRPUlxuICAgICAgICAgICAgICAgIHJldHVybiBjaCgweDIwMjgpXG4gICAgICAgICAgICB3aGVuICdQJ1xuICAgICAgICAgICAgICAgICMgVSsyMDI5IFBBUkFHUkFQSCBTRVBBUkFUT1JcbiAgICAgICAgICAgICAgICByZXR1cm4gY2goMHgyMDI5KVxuICAgICAgICAgICAgd2hlbiAneCdcbiAgICAgICAgICAgICAgICByZXR1cm4gVXRpbHMudXRmOGNocihVdGlscy5oZXhEZWModmFsdWUuc3Vic3RyKDIsIDIpKSlcbiAgICAgICAgICAgIHdoZW4gJ3UnXG4gICAgICAgICAgICAgICAgcmV0dXJuIFV0aWxzLnV0ZjhjaHIoVXRpbHMuaGV4RGVjKHZhbHVlLnN1YnN0cigyLCA0KSkpXG4gICAgICAgICAgICB3aGVuICdVJ1xuICAgICAgICAgICAgICAgIHJldHVybiBVdGlscy51dGY4Y2hyKFV0aWxzLmhleERlYyh2YWx1ZS5zdWJzdHIoMiwgOCkpKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiAnJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVuZXNjYXBlclxuIiwiXG5QYXR0ZXJuID0gcmVxdWlyZSAnLi9QYXR0ZXJuJ1xuXG4jIEEgYnVuY2ggb2YgdXRpbGl0eSBtZXRob2RzXG4jXG5jbGFzcyBVdGlsc1xuXG4gICAgQFJFR0VYX0xFRlRfVFJJTV9CWV9DSEFSOiAgIHt9XG4gICAgQFJFR0VYX1JJR0hUX1RSSU1fQllfQ0hBUjogIHt9XG4gICAgQFJFR0VYX1NQQUNFUzogICAgICAgICAgICAgIC9cXHMrL2dcbiAgICBAUkVHRVhfRElHSVRTOiAgICAgICAgICAgICAgL15cXGQrJC9cbiAgICBAUkVHRVhfT0NUQUw6ICAgICAgICAgICAgICAgL1teMC03XS9naVxuICAgIEBSRUdFWF9IRVhBREVDSU1BTDogICAgICAgICAvW15hLWYwLTldL2dpXG5cbiAgICAjIFByZWNvbXBpbGVkIGRhdGUgcGF0dGVyblxuICAgIEBQQVRURVJOX0RBVEU6ICAgICAgICAgICAgICBuZXcgUGF0dGVybiAnXicrXG4gICAgICAgICAgICAnKD88eWVhcj5bMC05XVswLTldWzAtOV1bMC05XSknK1xuICAgICAgICAgICAgJy0oPzxtb250aD5bMC05XVswLTldPyknK1xuICAgICAgICAgICAgJy0oPzxkYXk+WzAtOV1bMC05XT8pJytcbiAgICAgICAgICAgICcoPzooPzpbVHRdfFsgXFx0XSspJytcbiAgICAgICAgICAgICcoPzxob3VyPlswLTldWzAtOV0/KScrXG4gICAgICAgICAgICAnOig/PG1pbnV0ZT5bMC05XVswLTldKScrXG4gICAgICAgICAgICAnOig/PHNlY29uZD5bMC05XVswLTldKScrXG4gICAgICAgICAgICAnKD86XFwuKD88ZnJhY3Rpb24+WzAtOV0qKSk/JytcbiAgICAgICAgICAgICcoPzpbIFxcdF0qKD88dHo+WnwoPzx0el9zaWduPlstK10pKD88dHpfaG91cj5bMC05XVswLTldPyknK1xuICAgICAgICAgICAgJyg/OjooPzx0el9taW51dGU+WzAtOV1bMC05XSkpPykpPyk/JytcbiAgICAgICAgICAgICckJywgJ2knXG5cbiAgICAjIExvY2FsIHRpbWV6b25lIG9mZnNldCBpbiBtc1xuICAgIEBMT0NBTF9USU1FWk9ORV9PRkZTRVQ6ICAgICBuZXcgRGF0ZSgpLmdldFRpbWV6b25lT2Zmc2V0KCkgKiA2MCAqIDEwMDBcblxuICAgICMgVHJpbXMgdGhlIGdpdmVuIHN0cmluZyBvbiBib3RoIHNpZGVzXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0ciBUaGUgc3RyaW5nIHRvIHRyaW1cbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBfY2hhciBUaGUgY2hhcmFjdGVyIHRvIHVzZSBmb3IgdHJpbW1pbmcgKGRlZmF1bHQ6ICdcXFxccycpXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSBBIHRyaW1tZWQgc3RyaW5nXG4gICAgI1xuICAgIEB0cmltOiAoc3RyLCBfY2hhciA9ICdcXFxccycpIC0+XG4gICAgICAgIHJlZ2V4TGVmdCA9IEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUltfY2hhcl1cbiAgICAgICAgdW5sZXNzIHJlZ2V4TGVmdD9cbiAgICAgICAgICAgIEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUltfY2hhcl0gPSByZWdleExlZnQgPSBuZXcgUmVnRXhwICdeJytfY2hhcisnJytfY2hhcisnKidcbiAgICAgICAgcmVnZXhMZWZ0Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmVnZXhSaWdodCA9IEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVJbX2NoYXJdXG4gICAgICAgIHVubGVzcyByZWdleFJpZ2h0P1xuICAgICAgICAgICAgQFJFR0VYX1JJR0hUX1RSSU1fQllfQ0hBUltfY2hhcl0gPSByZWdleFJpZ2h0ID0gbmV3IFJlZ0V4cCBfY2hhcisnJytfY2hhcisnKiQnXG4gICAgICAgIHJlZ2V4UmlnaHQubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocmVnZXhMZWZ0LCAnJykucmVwbGFjZShyZWdleFJpZ2h0LCAnJylcblxuXG4gICAgIyBUcmltcyB0aGUgZ2l2ZW4gc3RyaW5nIG9uIHRoZSBsZWZ0IHNpZGVcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBzdHJpbmcgdG8gdHJpbVxuICAgICMgQHBhcmFtIFtTdHJpbmddIF9jaGFyIFRoZSBjaGFyYWN0ZXIgdG8gdXNlIGZvciB0cmltbWluZyAoZGVmYXVsdDogJ1xcXFxzJylcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtTdHJpbmddIEEgdHJpbW1lZCBzdHJpbmdcbiAgICAjXG4gICAgQGx0cmltOiAoc3RyLCBfY2hhciA9ICdcXFxccycpIC0+XG4gICAgICAgIHJlZ2V4TGVmdCA9IEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUltfY2hhcl1cbiAgICAgICAgdW5sZXNzIHJlZ2V4TGVmdD9cbiAgICAgICAgICAgIEBSRUdFWF9MRUZUX1RSSU1fQllfQ0hBUltfY2hhcl0gPSByZWdleExlZnQgPSBuZXcgUmVnRXhwICdeJytfY2hhcisnJytfY2hhcisnKidcbiAgICAgICAgcmVnZXhMZWZ0Lmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHJlZ2V4TGVmdCwgJycpXG5cblxuICAgICMgVHJpbXMgdGhlIGdpdmVuIHN0cmluZyBvbiB0aGUgcmlnaHQgc2lkZVxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdHIgVGhlIHN0cmluZyB0byB0cmltXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gX2NoYXIgVGhlIGNoYXJhY3RlciB0byB1c2UgZm9yIHRyaW1taW5nIChkZWZhdWx0OiAnXFxcXHMnKVxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gQSB0cmltbWVkIHN0cmluZ1xuICAgICNcbiAgICBAcnRyaW06IChzdHIsIF9jaGFyID0gJ1xcXFxzJykgLT5cbiAgICAgICAgcmVnZXhSaWdodCA9IEBSRUdFWF9SSUdIVF9UUklNX0JZX0NIQVJbX2NoYXJdXG4gICAgICAgIHVubGVzcyByZWdleFJpZ2h0P1xuICAgICAgICAgICAgQFJFR0VYX1JJR0hUX1RSSU1fQllfQ0hBUltfY2hhcl0gPSByZWdleFJpZ2h0ID0gbmV3IFJlZ0V4cCBfY2hhcisnJytfY2hhcisnKiQnXG4gICAgICAgIHJlZ2V4UmlnaHQubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UocmVnZXhSaWdodCwgJycpXG5cblxuICAgICMgQ2hlY2tzIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBlbXB0eSAobnVsbCwgdW5kZWZpbmVkLCBlbXB0eSBzdHJpbmcsIHN0cmluZyAnMCcsIGVtcHR5IEFycmF5LCBlbXB0eSBPYmplY3QpXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdIHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVja1xuICAgICNcbiAgICAjIEByZXR1cm4gW0Jvb2xlYW5dIHRydWUgaWYgdGhlIHZhbHVlIGlzIGVtcHR5XG4gICAgI1xuICAgIEBpc0VtcHR5OiAodmFsdWUpIC0+XG4gICAgICAgIHJldHVybiBub3QodmFsdWUpIG9yIHZhbHVlIGlzICcnIG9yIHZhbHVlIGlzICcwJyBvciAodmFsdWUgaW5zdGFuY2VvZiBBcnJheSBhbmQgdmFsdWUubGVuZ3RoIGlzIDApIG9yIEBpc0VtcHR5T2JqZWN0KHZhbHVlKVxuXG4gICAgIyBDaGVja3MgaWYgdGhlIGdpdmVuIHZhbHVlIGlzIGFuIGVtcHR5IG9iamVjdFxuICAgICNcbiAgICAjIEBwYXJhbSBbT2JqZWN0XSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2tcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlIGlmIHRoZSB2YWx1ZSBpcyBlbXB0eSBhbmQgaXMgYW4gb2JqZWN0XG4gICAgI1xuICAgIEBpc0VtcHR5T2JqZWN0OiAodmFsdWUpIC0+XG4gICAgICAgIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIE9iamVjdCBhbmQgKGsgZm9yIG93biBrIG9mIHZhbHVlKS5sZW5ndGggaXMgMFxuXG4gICAgIyBDb3VudHMgdGhlIG51bWJlciBvZiBvY2N1cmVuY2VzIG9mIHN1YlN0cmluZyBpbnNpZGUgc3RyaW5nXG4gICAgI1xuICAgICMgQHBhcmFtIFtTdHJpbmddIHN0cmluZyBUaGUgc3RyaW5nIHdoZXJlIHRvIGNvdW50IG9jY3VyZW5jZXNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSBzdWJTdHJpbmcgVGhlIHN1YlN0cmluZyB0byBjb3VudFxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSBzdGFydCBUaGUgc3RhcnQgaW5kZXhcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gbGVuZ3RoIFRoZSBzdHJpbmcgbGVuZ3RoIHVudGlsIHdoZXJlIHRvIGNvdW50XG4gICAgI1xuICAgICMgQHJldHVybiBbSW50ZWdlcl0gVGhlIG51bWJlciBvZiBvY2N1cmVuY2VzXG4gICAgI1xuICAgIEBzdWJTdHJDb3VudDogKHN0cmluZywgc3ViU3RyaW5nLCBzdGFydCwgbGVuZ3RoKSAtPlxuICAgICAgICBjID0gMFxuXG4gICAgICAgIHN0cmluZyA9ICcnICsgc3RyaW5nXG4gICAgICAgIHN1YlN0cmluZyA9ICcnICsgc3ViU3RyaW5nXG5cbiAgICAgICAgaWYgc3RhcnQ/XG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmdbc3RhcnQuLl1cbiAgICAgICAgaWYgbGVuZ3RoP1xuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nWzAuLi5sZW5ndGhdXG5cbiAgICAgICAgbGVuID0gc3RyaW5nLmxlbmd0aFxuICAgICAgICBzdWJsZW4gPSBzdWJTdHJpbmcubGVuZ3RoXG4gICAgICAgIGZvciBpIGluIFswLi4ubGVuXVxuICAgICAgICAgICAgaWYgc3ViU3RyaW5nIGlzIHN0cmluZ1tpLi4uc3VibGVuXVxuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgICAgIGkgKz0gc3VibGVuIC0gMVxuXG4gICAgICAgIHJldHVybiBjXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIGlucHV0IGlzIG9ubHkgY29tcG9zZWQgb2YgZGlnaXRzXG4gICAgI1xuICAgICMgQHBhcmFtIFtPYmplY3RdIGlucHV0IFRoZSB2YWx1ZSB0byB0ZXN0XG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gdHJ1ZSBpZiBpbnB1dCBpcyBvbmx5IGNvbXBvc2VkIG9mIGRpZ2l0c1xuICAgICNcbiAgICBAaXNEaWdpdHM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX0RJR0lUUy5sYXN0SW5kZXggPSAwXG4gICAgICAgIHJldHVybiBAUkVHRVhfRElHSVRTLnRlc3QgaW5wdXRcblxuXG4gICAgIyBEZWNvZGUgb2N0YWwgdmFsdWVcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gaW5wdXQgVGhlIHZhbHVlIHRvIGRlY29kZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdIFRoZSBkZWNvZGVkIHZhbHVlXG4gICAgI1xuICAgIEBvY3REZWM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX09DVEFMLmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KChpbnB1dCsnJykucmVwbGFjZShAUkVHRVhfT0NUQUwsICcnKSwgOClcblxuXG4gICAgIyBEZWNvZGUgaGV4YWRlY2ltYWwgdmFsdWVcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gaW5wdXQgVGhlIHZhbHVlIHRvIGRlY29kZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0ludGVnZXJdIFRoZSBkZWNvZGVkIHZhbHVlXG4gICAgI1xuICAgIEBoZXhEZWM6IChpbnB1dCkgLT5cbiAgICAgICAgQFJFR0VYX0hFWEFERUNJTUFMLmxhc3RJbmRleCA9IDBcbiAgICAgICAgaW5wdXQgPSBAdHJpbShpbnB1dClcbiAgICAgICAgaWYgKGlucHV0KycnKVswLi4uMl0gaXMgJzB4JyB0aGVuIGlucHV0ID0gKGlucHV0KycnKVsyLi5dXG4gICAgICAgIHJldHVybiBwYXJzZUludCgoaW5wdXQrJycpLnJlcGxhY2UoQFJFR0VYX0hFWEFERUNJTUFMLCAnJyksIDE2KVxuXG5cbiAgICAjIEdldCB0aGUgVVRGLTggY2hhcmFjdGVyIGZvciB0aGUgZ2l2ZW4gY29kZSBwb2ludC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW0ludGVnZXJdIGMgVGhlIHVuaWNvZGUgY29kZSBwb2ludFxuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gVGhlIGNvcnJlc3BvbmRpbmcgVVRGLTggY2hhcmFjdGVyXG4gICAgI1xuICAgIEB1dGY4Y2hyOiAoYykgLT5cbiAgICAgICAgY2ggPSBTdHJpbmcuZnJvbUNoYXJDb2RlXG4gICAgICAgIGlmIDB4ODAgPiAoYyAlPSAweDIwMDAwMClcbiAgICAgICAgICAgIHJldHVybiBjaChjKVxuICAgICAgICBpZiAweDgwMCA+IGNcbiAgICAgICAgICAgIHJldHVybiBjaCgweEMwIHwgYz4+NikgKyBjaCgweDgwIHwgYyAmIDB4M0YpXG4gICAgICAgIGlmIDB4MTAwMDAgPiBjXG4gICAgICAgICAgICByZXR1cm4gY2goMHhFMCB8IGM+PjEyKSArIGNoKDB4ODAgfCBjPj42ICYgMHgzRikgKyBjaCgweDgwIHwgYyAmIDB4M0YpXG5cbiAgICAgICAgcmV0dXJuIGNoKDB4RjAgfCBjPj4xOCkgKyBjaCgweDgwIHwgYz4+MTIgJiAweDNGKSArIGNoKDB4ODAgfCBjPj42ICYgMHgzRikgKyBjaCgweDgwIHwgYyAmIDB4M0YpXG5cblxuICAgICMgUmV0dXJucyB0aGUgYm9vbGVhbiB2YWx1ZSBlcXVpdmFsZW50IHRvIHRoZSBnaXZlbiBpbnB1dFxuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nfE9iamVjdF0gICAgaW5wdXQgICAgICAgVGhlIGlucHV0IHZhbHVlXG4gICAgIyBAcGFyYW0gW0Jvb2xlYW5dICAgICAgICAgIHN0cmljdCAgICAgIElmIHNldCB0byBmYWxzZSwgYWNjZXB0ICd5ZXMnIGFuZCAnbm8nIGFzIGJvb2xlYW4gdmFsdWVzXG4gICAgI1xuICAgICMgQHJldHVybiBbQm9vbGVhbl0gICAgICAgICB0aGUgYm9vbGVhbiB2YWx1ZVxuICAgICNcbiAgICBAcGFyc2VCb29sZWFuOiAoaW5wdXQsIHN0cmljdCA9IHRydWUpIC0+XG4gICAgICAgIGlmIHR5cGVvZihpbnB1dCkgaXMgJ3N0cmluZydcbiAgICAgICAgICAgIGxvd2VySW5wdXQgPSBpbnB1dC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBpZiBub3Qgc3RyaWN0XG4gICAgICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnbm8nIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICBpZiBsb3dlcklucHV0IGlzICcwJyB0aGVuIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgbG93ZXJJbnB1dCBpcyAnZmFsc2UnIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICBpZiBsb3dlcklucHV0IGlzICcnIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICByZXR1cm4gISFpbnB1dFxuXG5cblxuICAgICMgUmV0dXJucyB0cnVlIGlmIGlucHV0IGlzIG51bWVyaWNcbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gaW5wdXQgVGhlIHZhbHVlIHRvIHRlc3RcbiAgICAjXG4gICAgIyBAcmV0dXJuIFtCb29sZWFuXSB0cnVlIGlmIGlucHV0IGlzIG51bWVyaWNcbiAgICAjXG4gICAgQGlzTnVtZXJpYzogKGlucHV0KSAtPlxuICAgICAgICBAUkVHRVhfU1BBQ0VTLmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIHR5cGVvZihpbnB1dCkgaXMgJ251bWJlcicgb3IgdHlwZW9mKGlucHV0KSBpcyAnc3RyaW5nJyBhbmQgIWlzTmFOKGlucHV0KSBhbmQgaW5wdXQucmVwbGFjZShAUkVHRVhfU1BBQ0VTLCAnJykgaXNudCAnJ1xuXG5cbiAgICAjIFJldHVybnMgYSBwYXJzZWQgZGF0ZSBmcm9tIHRoZSBnaXZlbiBzdHJpbmdcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gc3RyIFRoZSBkYXRlIHN0cmluZyB0byBwYXJzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW0RhdGVdIFRoZSBwYXJzZWQgZGF0ZSBvciBudWxsIGlmIHBhcnNpbmcgZmFpbGVkXG4gICAgI1xuICAgIEBzdHJpbmdUb0RhdGU6IChzdHIpIC0+XG4gICAgICAgIHVubGVzcyBzdHI/Lmxlbmd0aFxuICAgICAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgICAjIFBlcmZvcm0gcmVndWxhciBleHByZXNzaW9uIHBhdHRlcm5cbiAgICAgICAgaW5mbyA9IEBQQVRURVJOX0RBVEUuZXhlYyBzdHJcbiAgICAgICAgdW5sZXNzIGluZm9cbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgICAgIyBFeHRyYWN0IHllYXIsIG1vbnRoLCBkYXlcbiAgICAgICAgeWVhciA9IHBhcnNlSW50IGluZm8ueWVhciwgMTBcbiAgICAgICAgbW9udGggPSBwYXJzZUludChpbmZvLm1vbnRoLCAxMCkgLSAxICMgSW4gamF2YXNjcmlwdCwgamFudWFyeSBpcyAwLCBmZWJydWFyeSAxLCBldGMuLi5cbiAgICAgICAgZGF5ID0gcGFyc2VJbnQgaW5mby5kYXksIDEwXG5cbiAgICAgICAgIyBJZiBubyBob3VyIGlzIGdpdmVuLCByZXR1cm4gYSBkYXRlIHdpdGggZGF5IHByZWNpc2lvblxuICAgICAgICB1bmxlc3MgaW5mby5ob3VyP1xuICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlIERhdGUuVVRDKHllYXIsIG1vbnRoLCBkYXkpXG4gICAgICAgICAgICByZXR1cm4gZGF0ZVxuXG4gICAgICAgICMgRXh0cmFjdCBob3VyLCBtaW51dGUsIHNlY29uZFxuICAgICAgICBob3VyID0gcGFyc2VJbnQgaW5mby5ob3VyLCAxMFxuICAgICAgICBtaW51dGUgPSBwYXJzZUludCBpbmZvLm1pbnV0ZSwgMTBcbiAgICAgICAgc2Vjb25kID0gcGFyc2VJbnQgaW5mby5zZWNvbmQsIDEwXG5cbiAgICAgICAgIyBFeHRyYWN0IGZyYWN0aW9uLCBpZiBnaXZlblxuICAgICAgICBpZiBpbmZvLmZyYWN0aW9uP1xuICAgICAgICAgICAgZnJhY3Rpb24gPSBpbmZvLmZyYWN0aW9uWzAuLi4zXVxuICAgICAgICAgICAgd2hpbGUgZnJhY3Rpb24ubGVuZ3RoIDwgM1xuICAgICAgICAgICAgICAgIGZyYWN0aW9uICs9ICcwJ1xuICAgICAgICAgICAgZnJhY3Rpb24gPSBwYXJzZUludCBmcmFjdGlvbiwgMTBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZnJhY3Rpb24gPSAwXG5cbiAgICAgICAgIyBDb21wdXRlIHRpbWV6b25lIG9mZnNldCBpZiBnaXZlblxuICAgICAgICBpZiBpbmZvLnR6P1xuICAgICAgICAgICAgdHpfaG91ciA9IHBhcnNlSW50IGluZm8udHpfaG91ciwgMTBcbiAgICAgICAgICAgIGlmIGluZm8udHpfbWludXRlP1xuICAgICAgICAgICAgICAgIHR6X21pbnV0ZSA9IHBhcnNlSW50IGluZm8udHpfbWludXRlLCAxMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHR6X21pbnV0ZSA9IDBcblxuICAgICAgICAgICAgIyBDb21wdXRlIHRpbWV6b25lIGRlbHRhIGluIG1zXG4gICAgICAgICAgICB0el9vZmZzZXQgPSAodHpfaG91ciAqIDYwICsgdHpfbWludXRlKSAqIDYwMDAwXG4gICAgICAgICAgICBpZiAnLScgaXMgaW5mby50el9zaWduXG4gICAgICAgICAgICAgICAgdHpfb2Zmc2V0ICo9IC0xXG5cbiAgICAgICAgIyBDb21wdXRlIGRhdGVcbiAgICAgICAgZGF0ZSA9IG5ldyBEYXRlIERhdGUuVVRDKHllYXIsIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmcmFjdGlvbilcbiAgICAgICAgaWYgdHpfb2Zmc2V0XG4gICAgICAgICAgICBkYXRlLnNldFRpbWUgZGF0ZS5nZXRUaW1lKCkgLSB0el9vZmZzZXRcblxuICAgICAgICByZXR1cm4gZGF0ZVxuXG5cbiAgICAjIFJlcGVhdHMgdGhlIGdpdmVuIHN0cmluZyBhIG51bWJlciBvZiB0aW1lc1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHN0ciAgICAgVGhlIHN0cmluZyB0byByZXBlYXRcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIG51bWJlciAgVGhlIG51bWJlciBvZiB0aW1lcyB0byByZXBlYXQgdGhlIHN0cmluZ1xuICAgICNcbiAgICAjIEByZXR1cm4gW1N0cmluZ10gIFRoZSByZXBlYXRlZCBzdHJpbmdcbiAgICAjXG4gICAgQHN0clJlcGVhdDogKHN0ciwgbnVtYmVyKSAtPlxuICAgICAgICByZXMgPSAnJ1xuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgbnVtYmVyXG4gICAgICAgICAgICByZXMgKz0gc3RyXG4gICAgICAgICAgICBpKytcbiAgICAgICAgcmV0dXJuIHJlc1xuXG5cbiAgICAjIFJlYWRzIHRoZSBkYXRhIGZyb20gdGhlIGdpdmVuIGZpbGUgcGF0aCBhbmQgcmV0dXJucyB0aGUgcmVzdWx0IGFzIHN0cmluZ1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIHBhdGggICAgICAgIFRoZSBwYXRoIHRvIHRoZSBmaWxlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBjYWxsYmFjayAgICBBIGNhbGxiYWNrIHRvIHJlYWQgZmlsZSBhc3luY2hyb25vdXNseSAob3B0aW9uYWwpXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgVGhlIHJlc3VsdGluZyBkYXRhIGFzIHN0cmluZ1xuICAgICNcbiAgICBAZ2V0U3RyaW5nRnJvbUZpbGU6IChwYXRoLCBjYWxsYmFjayA9IG51bGwpIC0+XG4gICAgICAgIHhociA9IG51bGxcbiAgICAgICAgaWYgd2luZG93P1xuICAgICAgICAgICAgaWYgd2luZG93LlhNTEh0dHBSZXF1ZXN0XG4gICAgICAgICAgICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICAgICAgICAgIGVsc2UgaWYgd2luZG93LkFjdGl2ZVhPYmplY3RcbiAgICAgICAgICAgICAgICBmb3IgbmFtZSBpbiBbXCJNc3htbDIuWE1MSFRUUC42LjBcIiwgXCJNc3htbDIuWE1MSFRUUC4zLjBcIiwgXCJNc3htbDIuWE1MSFRUUFwiLCBcIk1pY3Jvc29mdC5YTUxIVFRQXCJdXG4gICAgICAgICAgICAgICAgICAgIHRyeVxuICAgICAgICAgICAgICAgICAgICAgICAgeGhyID0gbmV3IEFjdGl2ZVhPYmplY3QobmFtZSlcblxuICAgICAgICBpZiB4aHI/XG4gICAgICAgICAgICAjIEJyb3dzZXJcbiAgICAgICAgICAgIGlmIGNhbGxiYWNrP1xuICAgICAgICAgICAgICAgICMgQXN5bmNcbiAgICAgICAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgeGhyLnJlYWR5U3RhdGUgaXMgNFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgeGhyLnN0YXR1cyBpcyAyMDAgb3IgeGhyLnN0YXR1cyBpcyAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soeGhyLnJlc3BvbnNlVGV4dClcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKVxuICAgICAgICAgICAgICAgIHhoci5vcGVuICdHRVQnLCBwYXRoLCB0cnVlXG4gICAgICAgICAgICAgICAgeGhyLnNlbmQgbnVsbFxuXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgIyBTeW5jXG4gICAgICAgICAgICAgICAgeGhyLm9wZW4gJ0dFVCcsIHBhdGgsIGZhbHNlXG4gICAgICAgICAgICAgICAgeGhyLnNlbmQgbnVsbFxuXG4gICAgICAgICAgICAgICAgaWYgeGhyLnN0YXR1cyBpcyAyMDAgb3IgeGhyLnN0YXR1cyA9PSAwXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VUZXh0XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIE5vZGUuanMtbGlrZVxuICAgICAgICAgICAgcmVxID0gcmVxdWlyZVxuICAgICAgICAgICAgZnMgPSByZXEoJ2ZzJykgIyBQcmV2ZW50IGJyb3dzZXJpZnkgZnJvbSB0cnlpbmcgdG8gbG9hZCAnZnMnIG1vZHVsZVxuICAgICAgICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgICAgICAgICAgIyBBc3luY1xuICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlIHBhdGgsIChlcnIsIGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgbnVsbFxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayBTdHJpbmcoZGF0YSlcblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICMgU3luY1xuICAgICAgICAgICAgICAgIGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMgcGF0aFxuICAgICAgICAgICAgICAgIGlmIGRhdGE/XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTdHJpbmcoZGF0YSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbFxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBVdGlsc1xuIiwiXG5QYXJzZXIgPSByZXF1aXJlICcuL1BhcnNlcidcbkR1bXBlciA9IHJlcXVpcmUgJy4vRHVtcGVyJ1xuVXRpbHMgID0gcmVxdWlyZSAnLi9VdGlscydcblxuIyBZYW1sIG9mZmVycyBjb252ZW5pZW5jZSBtZXRob2RzIHRvIGxvYWQgYW5kIGR1bXAgWUFNTC5cbiNcbmNsYXNzIFlhbWxcblxuICAgICMgUGFyc2VzIFlBTUwgaW50byBhIEphdmFTY3JpcHQgb2JqZWN0LlxuICAgICNcbiAgICAjIFRoZSBwYXJzZSBtZXRob2QsIHdoZW4gc3VwcGxpZWQgd2l0aCBhIFlBTUwgc3RyaW5nLFxuICAgICMgd2lsbCBkbyBpdHMgYmVzdCB0byBjb252ZXJ0IFlBTUwgaW4gYSBmaWxlIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyAgVXNhZ2U6XG4gICAgIyAgICAgbXlPYmplY3QgPSBZYW1sLnBhcnNlKCdzb21lOiB5YW1sJyk7XG4gICAgIyAgICAgY29uc29sZS5sb2cobXlPYmplY3QpO1xuICAgICNcbiAgICAjIEBwYXJhbSBbU3RyaW5nXSAgIGlucHV0ICAgICAgICAgICAgICAgICAgIEEgc3RyaW5nIGNvbnRhaW5pbmcgWUFNTFxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gIFRoZSBZQU1MIGNvbnZlcnRlZCB0byBhIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgICMgQHRocm93IFtQYXJzZUV4Y2VwdGlvbl0gSWYgdGhlIFlBTUwgaXMgbm90IHZhbGlkXG4gICAgI1xuICAgIEBwYXJzZTogKGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlID0gZmFsc2UsIG9iamVjdERlY29kZXIgPSBudWxsKSAtPlxuICAgICAgICByZXR1cm4gbmV3IFBhcnNlcigpLnBhcnNlKGlucHV0LCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKVxuXG5cbiAgICAjIFBhcnNlcyBZQU1MIGZyb20gZmlsZSBwYXRoIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyBUaGUgcGFyc2VGaWxlIG1ldGhvZCwgd2hlbiBzdXBwbGllZCB3aXRoIGEgWUFNTCBmaWxlLFxuICAgICMgd2lsbCBkbyBpdHMgYmVzdCB0byBjb252ZXJ0IFlBTUwgaW4gYSBmaWxlIGludG8gYSBKYXZhU2NyaXB0IG9iamVjdC5cbiAgICAjXG4gICAgIyAgVXNhZ2U6XG4gICAgIyAgICAgbXlPYmplY3QgPSBZYW1sLnBhcnNlRmlsZSgnY29uZmlnLnltbCcpO1xuICAgICMgICAgIGNvbnNvbGUubG9nKG15T2JqZWN0KTtcbiAgICAjXG4gICAgIyBAcGFyYW0gW1N0cmluZ10gICBwYXRoICAgICAgICAgICAgICAgICAgICBBIGZpbGUgcGF0aCBwb2ludGluZyB0byBhIHZhbGlkIFlBTUwgZmlsZVxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgIyBAcGFyYW0gW0Z1bmN0aW9uXSBvYmplY3REZWNvZGVyICAgICAgICAgICBBIGZ1bmN0aW9uIHRvIGRlc2VyaWFsaXplIGN1c3RvbSBvYmplY3RzLCBudWxsIG90aGVyd2lzZVxuICAgICNcbiAgICAjIEByZXR1cm4gW09iamVjdF0gIFRoZSBZQU1MIGNvbnZlcnRlZCB0byBhIEphdmFTY3JpcHQgb2JqZWN0IG9yIG51bGwgaWYgdGhlIGZpbGUgZG9lc24ndCBleGlzdC5cbiAgICAjXG4gICAgIyBAdGhyb3cgW1BhcnNlRXhjZXB0aW9uXSBJZiB0aGUgWUFNTCBpcyBub3QgdmFsaWRcbiAgICAjXG4gICAgQHBhcnNlRmlsZTogKHBhdGgsIGNhbGxiYWNrID0gbnVsbCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSA9IGZhbHNlLCBvYmplY3REZWNvZGVyID0gbnVsbCkgLT5cbiAgICAgICAgaWYgY2FsbGJhY2s/XG4gICAgICAgICAgICAjIEFzeW5jXG4gICAgICAgICAgICBVdGlscy5nZXRTdHJpbmdGcm9tRmlsZSBwYXRoLCAoaW5wdXQpID0+XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbnVsbFxuICAgICAgICAgICAgICAgIGlmIGlucHV0P1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBAcGFyc2UgaW5wdXQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayByZXN1bHRcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBTeW5jXG4gICAgICAgICAgICBpbnB1dCA9IFV0aWxzLmdldFN0cmluZ0Zyb21GaWxlIHBhdGhcbiAgICAgICAgICAgIGlmIGlucHV0P1xuICAgICAgICAgICAgICAgIHJldHVybiBAcGFyc2UgaW5wdXQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUsIG9iamVjdERlY29kZXJcbiAgICAgICAgICAgIHJldHVybiBudWxsXG5cblxuICAgICMgRHVtcHMgYSBKYXZhU2NyaXB0IG9iamVjdCB0byBhIFlBTUwgc3RyaW5nLlxuICAgICNcbiAgICAjIFRoZSBkdW1wIG1ldGhvZCwgd2hlbiBzdXBwbGllZCB3aXRoIGFuIG9iamVjdCwgd2lsbCBkbyBpdHMgYmVzdFxuICAgICMgdG8gY29udmVydCB0aGUgb2JqZWN0IGludG8gZnJpZW5kbHkgWUFNTC5cbiAgICAjXG4gICAgIyBAcGFyYW0gW09iamVjdF0gICBpbnB1dCAgICAgICAgICAgICAgICAgICBKYXZhU2NyaXB0IG9iamVjdFxuICAgICMgQHBhcmFtIFtJbnRlZ2VyXSAgaW5saW5lICAgICAgICAgICAgICAgICAgVGhlIGxldmVsIHdoZXJlIHlvdSBzd2l0Y2ggdG8gaW5saW5lIFlBTUxcbiAgICAjIEBwYXJhbSBbSW50ZWdlcl0gIGluZGVudCAgICAgICAgICAgICAgICAgIFRoZSBhbW91bnQgb2Ygc3BhY2VzIHRvIHVzZSBmb3IgaW5kZW50YXRpb24gb2YgbmVzdGVkIG5vZGVzLlxuICAgICMgQHBhcmFtIFtCb29sZWFuXSAgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSAgdHJ1ZSBpZiBhbiBleGNlcHRpb24gbXVzdCBiZSB0aHJvd24gb24gaW52YWxpZCB0eXBlcyAoYSBKYXZhU2NyaXB0IHJlc291cmNlIG9yIG9iamVjdCksIGZhbHNlIG90aGVyd2lzZVxuICAgICMgQHBhcmFtIFtGdW5jdGlvbl0gb2JqZWN0RW5jb2RlciAgICAgICAgICAgQSBmdW5jdGlvbiB0byBzZXJpYWxpemUgY3VzdG9tIG9iamVjdHMsIG51bGwgb3RoZXJ3aXNlXG4gICAgI1xuICAgICMgQHJldHVybiBbU3RyaW5nXSAgQSBZQU1MIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG9yaWdpbmFsIEphdmFTY3JpcHQgb2JqZWN0XG4gICAgI1xuICAgIEBkdW1wOiAoaW5wdXQsIGlubGluZSA9IDIsIGluZGVudCA9IDQsIGV4Y2VwdGlvbk9uSW52YWxpZFR5cGUgPSBmYWxzZSwgb2JqZWN0RW5jb2RlciA9IG51bGwpIC0+XG4gICAgICAgIHlhbWwgPSBuZXcgRHVtcGVyKClcbiAgICAgICAgeWFtbC5pbmRlbnRhdGlvbiA9IGluZGVudFxuXG4gICAgICAgIHJldHVybiB5YW1sLmR1bXAoaW5wdXQsIGlubGluZSwgMCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcilcblxuXG4gICAgIyBSZWdpc3RlcnMgLnltbCBleHRlbnNpb24gdG8gd29yayB3aXRoIG5vZGUncyByZXF1aXJlKCkgZnVuY3Rpb24uXG4gICAgI1xuICAgIEByZWdpc3RlcjogLT5cbiAgICAgICAgcmVxdWlyZV9oYW5kbGVyID0gKG1vZHVsZSwgZmlsZW5hbWUpIC0+XG4gICAgICAgICAgICAjIEZpbGwgaW4gcmVzdWx0XG4gICAgICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IFlBTUwucGFyc2VGaWxlIGZpbGVuYW1lXG5cbiAgICAgICAgIyBSZWdpc3RlciByZXF1aXJlIGV4dGVuc2lvbnMgb25seSBpZiB3ZSdyZSBvbiBub2RlLmpzXG4gICAgICAgICMgaGFjayBmb3IgYnJvd3NlcmlmeVxuICAgICAgICBpZiByZXF1aXJlPy5leHRlbnNpb25zP1xuICAgICAgICAgICAgcmVxdWlyZS5leHRlbnNpb25zWycueW1sJ10gPSByZXF1aXJlX2hhbmRsZXJcbiAgICAgICAgICAgIHJlcXVpcmUuZXh0ZW5zaW9uc1snLnlhbWwnXSA9IHJlcXVpcmVfaGFuZGxlclxuXG5cbiAgICAjIEFsaWFzIG9mIGR1bXAoKSBtZXRob2QgZm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucy5cbiAgICAjXG4gICAgQHN0cmluZ2lmeTogKGlucHV0LCBpbmxpbmUsIGluZGVudCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlcikgLT5cbiAgICAgICAgcmV0dXJuIEBkdW1wIGlucHV0LCBpbmxpbmUsIGluZGVudCwgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RW5jb2RlclxuXG5cbiAgICAjIEFsaWFzIG9mIHBhcnNlRmlsZSgpIG1ldGhvZCBmb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLlxuICAgICNcbiAgICBAbG9hZDogKHBhdGgsIGNhbGxiYWNrLCBleGNlcHRpb25PbkludmFsaWRUeXBlLCBvYmplY3REZWNvZGVyKSAtPlxuICAgICAgICByZXR1cm4gQHBhcnNlRmlsZSBwYXRoLCBjYWxsYmFjaywgZXhjZXB0aW9uT25JbnZhbGlkVHlwZSwgb2JqZWN0RGVjb2RlclxuXG5cbiMgRXhwb3NlIFlBTUwgbmFtZXNwYWNlIHRvIGJyb3dzZXJcbndpbmRvdz8uWUFNTCA9IFlhbWxcblxuIyBOb3QgaW4gdGhlIGJyb3dzZXI/XG51bmxlc3Mgd2luZG93P1xuICAgIEBZQU1MID0gWWFtbFxuXG5tb2R1bGUuZXhwb3J0cyA9IFlhbWxcbiJdfQ==
