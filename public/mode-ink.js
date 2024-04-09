ace.define("ace/mode/jsdoc_comment_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module){"use strict";
var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var JsDocCommentHighlightRules = function () {
    this.$rules = {
        "start": [
            {
                token: ["comment.doc.tag", "comment.doc.text", "lparen.doc"],
                regex: "(@(?:param|member|typedef|property|namespace|var|const|callback))(\\s*)({)",
                push: [
                    {
                        token: "lparen.doc",
                        regex: "{",
                        push: [
                            {
                                include: "doc-syntax"
                            }, {
                                token: "rparen.doc",
                                regex: "}|(?=$)",
                                next: "pop"
                            }
                        ]
                    }, {
                        token: ["rparen.doc", "text.doc", "variable.parameter.doc", "lparen.doc", "variable.parameter.doc", "rparen.doc"],
                        regex: /(})(\s*)(?:([\w=:\/\.]+)|(?:(\[)([\w=:\/\.]+)(\])))/,
                        next: "pop"
                    }, {
                        token: "rparen.doc",
                        regex: "}|(?=$)",
                        next: "pop"
                    }, {
                        include: "doc-syntax"
                    }, {
                        defaultToken: "text.doc"
                    }
                ]
            }, {
                token: ["comment.doc.tag", "text.doc", "lparen.doc"],
                regex: "(@(?:returns?|yields|type|this|suppress|public|protected|private|package|modifies|"
                    + "implements|external|exception|throws|enum|define|extends))(\\s*)({)",
                push: [
                    {
                        token: "lparen.doc",
                        regex: "{",
                        push: [
                            {
                                include: "doc-syntax"
                            }, {
                                token: "rparen.doc",
                                regex: "}|(?=$)",
                                next: "pop"
                            }
                        ]
                    }, {
                        token: "rparen.doc",
                        regex: "}|(?=$)",
                        next: "pop"
                    }, {
                        include: "doc-syntax"
                    }, {
                        defaultToken: "text.doc"
                    }
                ]
            }, {
                token: ["comment.doc.tag", "text.doc", "variable.parameter.doc"],
                regex: "(@(?:alias|memberof|instance|module|name|lends|namespace|external|this|template|"
                    + "requires|param|implements|function|extends|typedef|mixes|constructor|var|"
                    + "memberof\\!|event|listens|exports|class|constructs|interface|emits|fires|"
                    + "throws|const|callback|borrows|augments))(\\s+)(\\w[\\w#\.:\/~\"\\-]*)?"
            }, {
                token: ["comment.doc.tag", "text.doc", "variable.parameter.doc"],
                regex: "(@method)(\\s+)(\\w[\\w\.\\(\\)]*)"
            }, {
                token: "comment.doc.tag",
                regex: "@access\\s+(?:private|public|protected)"
            }, {
                token: "comment.doc.tag",
                regex: "@kind\\s+(?:class|constant|event|external|file|function|member|mixin|module|namespace|typedef)"
            }, {
                token: "comment.doc.tag",
                regex: "@\\w+(?=\\s|$)"
            },
            JsDocCommentHighlightRules.getTagRule(),
            {
                defaultToken: "comment.doc",
                caseInsensitive: true
            }
        ],
        "doc-syntax": [{
                token: "operator.doc",
                regex: /[|:]/
            }, {
                token: "paren.doc",
                regex: /[\[\]]/
            }]
    };
    this.normalizeRules();
};
oop.inherits(JsDocCommentHighlightRules, TextHighlightRules);
JsDocCommentHighlightRules.getTagRule = function (start) {
    return {
        token: "comment.doc.tag.storage.type",
        regex: "\\b(?:TODO|FIXME|XXX|HACK)\\b"
    };
};
JsDocCommentHighlightRules.getStartRule = function (start) {
    return {
        token: "comment.doc", // doc comment
        regex: "\\/\\*(?=\\*)",
        next: start
    };
};
JsDocCommentHighlightRules.getEndRule = function (start) {
    return {
        token: "comment.doc", // closing comment
        regex: "\\*\\/",
        next: start
    };
};
exports.JsDocCommentHighlightRules = JsDocCommentHighlightRules;

});

// === INK higlight rules (from line 10 - )

//===


ace.define("ace/mode/inkHighlightRules",["require","exports","module","ace/lib/oop","ace/mode/jsdoc_comment_highlight_rules","ace/mode/text_highlight_rules"], function(require, exports, module){"use strict";
var oop = require("../lib/oop");
var DocCommentHighlightRules = require("./jsdoc_comment_highlight_rules").JsDocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";

var inkHighlightRules = function (options) {
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = {
      start: [{
          include: "#escapes"
      }, {
          include: "#comments"
      }, {
          regex: /^(\s*)(={2,})(\s*)((?:function)?)(\s*)(\w+)(\s*)(\([\w,\s->]*\))?(\s*)((?:={1,})?)/,
          token: [
              "",
              "flow.knot.declaration.punctuation",  // ===
              "flow.knot.declaration",              // whitespace
              "flow.knot.declaration.function",     // function (optional)
              "flow.knot.declaration",              // whitespace
              "flow.knot.declaration.name",         // knot_name
              "flow.knot.declaration",              // whitespace
              "flow.knot.declaration.parameters",   // (arg1, arg2)
              "flow.knot.declaration",              // whitespace
              "flow.knot.declaration.punctuation"   // ====
          ]
      }, {
          regex: /^(\s*)(=)(\s*)(\w+)(\s*)(\([\w,\s->]*\))?/,
          token: [
              "flow.stitch.declaration",             // whitespace
              "flow.stitch.declaration.punctuation", // =
              "flow.stitch.declaration",             // whitespace
              "flow.stitch.declaration.name",        // stitch_name
              "flow.stitch.declaration",             // whitespace
              "flow.stitch.declaration.parameters"   // parameters
          ]
      }, {
          include: "#statements"
      }],
      "#TODO": [{
          regex: /^(\s*)(TODO\b)(.*)/,
          token: [
              "todo",         // whitespace
              "todo.TODO",    // TODO
              "todo"          // user text
          ]
      }],
      "#choice": [{
          regex: /^(\s*)((?:[\*\+]\s?)+)(\s*)(?:(\(\s*)(\w+)(\s*\)))?/,
          token: [
              "choice",                           // whitespace
              "choice.bullets",                   // * or +
              "choice",                           // whitespace
              "choice.label",                     // ( 
              "choice.label.name",                // label_name
              "choice.label"                      // )
          ],

          // Sub section within choice
          push: [{
              token: "choice",
              regex: /$/,
              next: "pop"
          }, {
              token: "choice.weaveBracket", 
              regex: /\s*\[\s*/,                  // [ weave start 
              push: [{ 
                  token: "choice.weaveBracket", 
                  regex: /\s*\]\s*/,              // ] weave end 
                  next: "start"
              }, {
                  include: "#inlineContent" 
              }, {
                  defaultToken: "choice.weaveInsideBrackets" 
              }]
          }, {
              include: "#choice"
          }, {
              include: "#gather"
          }, {
              include: "#mixedContent"
          }, {
              include: "#comments"
          }, {
              defaultToken: "choice"
          }]
      }],
      "#escapes": [{
          token: "escape",
          regex: /\\[\[\]()\\~{}\/#*+-]/  // backslash escape sequences (e.g. \\ or \[ or \] or \~ or \#)
      }],
      "#comments": [{
          token: "punctuation.definition.comment.json",
          regex: /\/\*\*/,            // /** comment block
          push: [{
              token: "punctuation.definition.comment.json",
              regex: /\*\//,          // end comment block */
              next: "pop"
          }, {
              defaultToken: "comment.block.documentation.json"
          }]
      }, {
          token: "punctuation.definition.comment.json",
          regex: /\/\*/,              // /* comment block 
          push: [{
              token: "punctuation.definition.comment.json",
              regex: /\*\//,          // end comment block */
              next: "pop"
          }, {
              defaultToken: "comment.block.json"
          }]
      }, {
          token: [
              "punctuation.definition.comment.json",
              "comment.line.double-slash.js"
          ],
          regex: /(\/\/)(.*$)/        // // comment
      }],

      // Try different types of divert in sequence, since it's a bit complicated
      // to try to do it in one expression!
      // It's partly complicated because we need to parse it fairly accurately in
      // order to find the divert targets for hyperlinking.
      "#divert": [{
          // -> DONE|END
          regex: /(->|<-)(\s*)(DONE|END)(\s*)/,
          token: [
              "divert.operator",      // ->
              "divert",               // whitespace
              "divert.to-special",    // DONE / END
              "divert"               // whitespace
          ]
      }, {
          // Tunnel onwards
          regex: /(->->)(\s*)(\w[\w\.\s]*)/,
          token: [
              "divert.to-tunnel",      // ->->
              "divert",                // whitespace
              "divert.target"          // target.name
          ]
      }, {
          // Divert with parameters: -> knot (param, -> param2)
          regex: /(->|<-)(\s*)(\w[\w\.\s]*?)(\s*)(\()/,
          token: [
              "divert.operator",  // ->
              "divert",           // whitespace
              "divert.target",    // target.name
              "divert",           // whitespace
              "divert.operator",  // (
          ],
          push: [{
              // Divert target, as parameter to the current divert
              regex: /(->)(\s*)(\w[\w\.\s]*?)(\s*)(?![\w\.])/,
              token: [
                  "divert.parameter.operator",  // ->
                  "divert.parameter",           // whitespace
                  "divert.target",              // target.name
                  "divert.parameter"            // whitespace
              ]
          }, {
              // Explicitly parse function calls so that the close bracket
              // doesn't accidentally get parsed as the end of the parameters
              include: "#functionCallInDivertParameter"
          }, {
              regex: /\)/,
              token: "divert.parameter.operator",
              next: "pop"
          }, {
              defaultToken: "divert.parameter"
          }]
      }, {
          // Vanilla divert
          regex: /(->|<-)(\s*)(\w[\w\.\s]*?)(\s*)(?![\w\.])/,
          token: [
              "divert.operator",  // -> | <-
              "divert",           // whitespace
              "divert.target",    // target.name
              "divert"            // whitespace
          ]
      }, {
          // Divert to gather/choice point, or end of tunnel divert
          regex: /->/,
          token: "divert.operator"
      }],

      // Used to parse function calls within divert parameters so that
      // the closing bracket doesn't accidentally cause the rule to end early. 
      // Having it as a separate rule also allows it to be recursive.
      "#functionCallInDivertParameter": [{
          regex: /\w+\s*\(/,
          token: "divert.parameter",
          push: [{
              "include": "#functionCallInDivertParameter"
          }, {
              regex: /\)/,
              token: "divert.parameter",
              next: "pop"
          }, {
              defaultToken: "divert.parameter"
          }]
      }],

      "#gather": [{
          regex: /^(\s*)((?:-(?!>)\s*)+)/,
          token: [
              "gather",         // whitespace
              "gather.bullets", // - - 
          ],
          push: [{
              regex: /$/,
              token: "gather",
              next: "pop"
          }, {
              include: "#escapes"
          }, {
              include: "#gather"
          }, {
              include: "#comments"
          }, {
              include: "#logicLineInsert"
          }, {
              regex: /(\(\s*)(\w+)(\s*\)\s*)/,
              token: [
                  "gather.label",      // (
                  "gather.label.name", // label_name
                  "gather.label"       // )
              ],
          }, {
              include: "#choice"
          }, {
              include: "#mixedContent"
          }, {
              defaultToken: "gather.innerContent"
          }]
      }],

      "#globalVAR": [{
          regex: /^(\s*)(VAR|CONST)\b/, // (\s*)(\w+)(\s*)
          token: [
              "var-decl", // whitespace
              "var-decl.keyword"
          ],
          
          push: [{
              regex: /(\s*)(\w+)(\s*)/,
              token: [
                  "var-decl",      // whitespace
                  "var-decl.name", // var_name
                  "var-decl"       // whitespace
              ]
          }, 

          // The rest of the assignment line
          { 
              regex: /$/,
              token: "var-decl",
              next: "pop"
          }, {
              include: "#comments"
          }, {
              defaultToken: "var-decl"
          }]
      }],

      "#listDef": [{
          regex: /^(\s*)(LIST)\b/,
          token: [
              "list-decl", // whitespace
              "list-decl.keyword"
          ],
          
          push: [{
              regex: /(\s*)(\w+)(\s*)/,
              token: [
                  "list-decl",      // whitespace
                  "list-decl.name", // var_name
                  "list-decl"       // whitespace
              ]
          }, 

          // The rest of the assignment line
          { 
              regex: /$/,
              token: "list-decl",
              next: "pop"
          }, {
              include: "#comments"
          }, {
              defaultToken: "list-decl"
          }]
      }],

      "#INCLUDE": [{
          regex: /(\s*)(INCLUDE\b)/,
          token: [
              "include",
              "include.keyword"
          ],

          push: [{
              regex: /(\s*)([^\r\n]+)/,
              token: [
                  "include", // whitespace
                  "include.filepath"
              ]
          }, 

          // The rest of the assignment line
          { 
              regex: /$/,
              token: "include",
              next: "pop"
          }, {
              defaultToken: "include"
          }]
      }],

      "#EXTERNAL": [{
          regex: /(\s*)(EXTERNAL\b)/,
          token: [
              "external",
              "external.keyword"
          ],

          // The rest of the external line until a newline
          push: [{
              regex: /(\s*)(\w+)(\([\w,\s->]*\))?/,
              token: [
                  "external", // whitespace
                  "external.declaration.name", //function name
                  "external.declaration.parameters" //function parameters

              ]
          }, 
          { 
              regex: /$/,
              token: "external",
              next: "pop"
          }, {
              defaultToken: "external"
          }]
      }],

      "#inlineConditional": [{
          regex: /(\{)([^:\|\}]+:)/,
          token: [
              "logic.punctuation",
              "logic.inline.conditional.condition"
          ],
          push: [{
              token: "logic.inline.conditional.punctuation",
              regex: /\}/,
              next: "pop"
          }, {
              token: "logic.inline.conditional.punctuation",
              regex: /\|/
          }, {
              include: "#mixedContent"
          }, {
              defaultToken: "logic.inline.innerContent"
          }]
      }],
      "#inlineSequence": [{
          regex: /(\{)(\s*)((?:~|&|!|\$)?)(?=[^\|\}]*\|)/, // Try look ahead to make sure there's a pipe char
          token: [
              "logic.punctuation", // {
              "logic.sequence", // whitespace
              "logic.sequence.operator" // sequence type char (~&!$)
          ],
          push: [{
              token: "logic.punctuation", // }
              regex: /\}/,
              next: "pop"
          }, {
              token: "logic.sequence.punctuation", // | (but not ||)
              regex: /\|(?!\|)/
          }, {
              include: "#mixedContent"
          }, {
              defaultToken: "logic.sequence.innerContent"
          }]
      }],
      "#inlineLogic": [{
          token: "logic.punctuation",
          regex: /\{/,
          push: [{
              token: "logic.punctuation",
              regex: /\}/,
              next: "pop"
          }, {
              defaultToken: "logic.inline"
          }]
      }],
      "#multiLineLogic": [{
          regex: /^(\s*)(\{)(?:([^}:]+)(:))?(?=[^}]*$)/,
          token: [
              "logic",                                             // whitespace
              "logic.punctuation",                                 // {
              "logic.conditional.multiline.condition",             // optional initial condition
              "logic.conditional.multiline.condition.punctuation"  // :
          ],
          push: [{
              token: "logic.punctuation",                          // }
              regex: /\}/, 
              next: "pop"
          }, {
              regex: /^\s*else\s*\:/,             
              token: "conditional.multiline.else"                  // else :
          }, {
              regex: /^(\s*)(-)(?!>)((?:\s?[^:\{}]+):)?/,
              token: [
                  "logic.multiline.branch",                       // whitespace
                  "logic.multiline.branch.operator",              // - 
                  "logic.multiline.branch.condition"              // 
              ]
          }, {
              include: "#statements"
          }, {
              defaultToken: "logic.multiline.innerContent"
          }]
      }],
      "#logicLine": [{
          token: "logic.tilda",
          regex: /^\s*~\s*/,
          push: [{
              token: "logic.tilda",
              regex: /$/,
              next: "pop"
          }, {
              include: "#escapes"
          }, {
              include: "#comments"
          }, {
              defaultToken: "logic.tilda"
          }]
      }],
      "#logicLineInsert": [{
          token: "logic.tilda",
          regex: /\s*~\s*/,
          push: [{
              token: "logic.tilda",
              regex: /$/,
              next: "pop"
          }, {
              include: "#escapes"
          }, {
              include: "#comments"
          }, {
              defaultToken: "logic.tilda"
          }]
      }],
      "#tags": [{
          // e.g. #tag should be highlighted
          token: "tag",

          // End of tag condition: Note that it's very hard to get
          // this exactly right because because you can do both:
          //
          //   1. # {blue|red|green} {one|two}      
          //   2. {red #red|blue #blue|green #green} 
          //
          // So we can't have "{" or "}" signify the end of a tag
          // since that would break the most common case (1), but
          // the compromise is that it breaks the less usual case (2).
          // (Maybe there's a way to handle this with Ace's push/pop
          //  state/stack based system? I never fully understood how
          //  it works!)
          //
          // Right now we simply assume that tags are always at the
          // of a line unless they're in a choice, in which case we
          // stop parsing the tag at "[" or "]".
          regex: /#[^\[\]$]+/
      }],
      "#inlineContent": [{ 
          include: "#inlineConditional"
      }, {
          include: "#inlineSequence"
      }, {
          include: "#inlineLogic"
      }], 
      "#mixedContent": [{ 
          include: "#inlineContent" 
      }, {
          include: "#divert"
      }, {
          include: "#tags"
      }, {
          token: "glue",
          regex: /<>/
      }],
      "#statements": [{
          include: "#comments"
      }, {
          include: "#escapes"
      }, {
          include: "#TODO"
      }, {
          include: "#globalVAR"
      }, {
          include: "#listDef"
      }, {
          include: "#EXTERNAL"
      }, {
          include: "#INCLUDE"
      }, {
          include: "#choice"
      }, {
          include: "#gather"
      }, {
          include: "#multiLineLogic"
      }, {
          include: "#endOfSection"
      }, {
          include: "#logicLine"
      }, {
          include: "#mixedContent"
      }, {
          include: "#customInstruction"
      }],

      // This will be added when overriden in project settings
      // "#customInstruction": [{
      // }],
  }
    this.normalizeRules();
};


inkHighlightRules.metaData = {
  fileTypes: ["ink", "ink2"],
  name: "ink",
  scopeName: "source.ink"
}

oop.inherits(inkHighlightRules, TextHighlightRules);

//oop.inherits(JavaScriptHighlightRules, TextHighlightRules);
function JSX() {
    var tagRegex = identifierRe.replace("\\d", "\\d\\-");
    var jsxTag = {
        onMatch: function (val, state, stack) {
            var offset = val.charAt(1) == "/" ? 2 : 1;
            if (offset == 1) {
                if (state != this.nextState)
                    stack.unshift(this.next, this.nextState, 0);
                else
                    stack.unshift(this.next);
                stack[2]++;
            }
            else if (offset == 2) {
                if (state == this.nextState) {
                    stack[1]--;
                    if (!stack[1] || stack[1] < 0) {
                        stack.shift();
                        stack.shift();
                    }
                }
            }
            return [{
                    type: "meta.tag.punctuation." + (offset == 1 ? "" : "end-") + "tag-open.xml",
                    value: val.slice(0, offset)
                }, {
                    type: "meta.tag.tag-name.xml",
                    value: val.substr(offset)
                }];
        },
        regex: "</?" + tagRegex + "",
        next: "jsxAttributes",
        nextState: "jsx"
    };
    this.$rules.start.unshift(jsxTag);
    var jsxJsRule = {
        regex: "{",
        token: "paren.quasi.start",
        push: "start"
    };
    this.$rules.jsx = [
        jsxJsRule,
        jsxTag,
        { include: "reference" },
        { defaultToken: "string" }
    ];
    this.$rules.jsxAttributes = [{
            token: "meta.tag.punctuation.tag-close.xml",
            regex: "/?>",
            onMatch: function (value, currentState, stack) {
                if (currentState == stack[0])
                    stack.shift();
                if (value.length == 2) {
                    if (stack[0] == this.nextState)
                        stack[1]--;
                    if (!stack[1] || stack[1] < 0) {
                        stack.splice(0, 2);
                    }
                }
                this.next = stack[0] || "start";
                return [{ type: this.token, value: value }];
            },
            nextState: "jsx"
        },
        jsxJsRule,
        comments("jsxAttributes"),
        {
            token: "entity.other.attribute-name.xml",
            regex: tagRegex
        }, {
            token: "keyword.operator.attribute-equals.xml",
            regex: "="
        }, {
            token: "text.tag-whitespace.xml",
            regex: "\\s+"
        }, {
            token: "string.attribute-value.xml",
            regex: "'",
            stateName: "jsx_attr_q",
            push: [
                { token: "string.attribute-value.xml", regex: "'", next: "pop" },
                { include: "reference" },
                { defaultToken: "string.attribute-value.xml" }
            ]
        }, {
            token: "string.attribute-value.xml",
            regex: '"',
            stateName: "jsx_attr_qq",
            push: [
                { token: "string.attribute-value.xml", regex: '"', next: "pop" },
                { include: "reference" },
                { defaultToken: "string.attribute-value.xml" }
            ]
        },
        jsxTag
    ];
    this.$rules.reference = [{
            token: "constant.language.escape.reference.xml",
            regex: "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"
        }];
}
function comments(next) {
    return [
        {
            token: "comment", // multi line comment
            regex: /\/\*/,
            next: [
                DocCommentHighlightRules.getTagRule(),
                { token: "comment", regex: "\\*\\/", next: next || "pop" },
                { defaultToken: "comment", caseInsensitive: true }
            ]
        }, {
            token: "comment",
            regex: "\\/\\/",
            next: [
                DocCommentHighlightRules.getTagRule(),
                { token: "comment", regex: "$|^", next: next || "pop" },
                { defaultToken: "comment", caseInsensitive: true }
            ]
        }
    ];
}
exports.JavaScriptHighlightRules = JavaScriptHighlightRules;

});

ace.define("ace/mode/matching_brace_outdent",["require","exports","module","ace/range"], function(require, exports, module){"use strict";
var Range = require("../range").Range;
var MatchingBraceOutdent = function () { };
(function () {
    this.checkOutdent = function (line, input) {
        if (!/^\s+$/.test(line))
            return false;
        return /^\s*\}/.test(input);
    };
    this.autoOutdent = function (doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\})/);
        if (!match)
            return 0;
        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({ row: row, column: column });
        if (!openBracePos || openBracePos.row == row)
            return 0;
        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column - 1), indent);
    };
    this.$getIndent = function (line) {
        return line.match(/^\s*/)[0];
    };
}).call(MatchingBraceOutdent.prototype);
exports.MatchingBraceOutdent = MatchingBraceOutdent;

});

ace.define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"], function(require, exports, module){"use strict";
var oop = require("../../lib/oop");
var Range = require("../../range").Range;
var BaseFoldMode = require("./fold_mode").FoldMode;
var FoldMode = exports.FoldMode = function (commentRegex) {
    if (commentRegex) {
        this.foldingStartMarker = new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start));
        this.foldingStopMarker = new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end));
    }
};
oop.inherits(FoldMode, BaseFoldMode);
(function () {
  //INK --------- (from Line 551)
// Use a regular expression to say which line starts a fold.   

this.foldingStartMarker =  /^(\s*)(=)(?<knot>={1,})?(\s*)((?:function)?)(\s*)(\w+)(\s*)(\([\w,\s->]*\))?(\s*)((?:={1,})?)/; 

// Get the range of text that will be included in the fold. 

// Note - properties of Range : {start : {row, column}, end : {row, column}}
// Different then the ones provided in Ace documentation

this.getFoldWidgetRange = function(session, foldStyle, row) {
    var line = session.getLine(row);
    var matchResult = line.match(this.foldingStartMarker)
    
    // Check to see if the we're folding a knot or a stitch is a knot or a stitch. 
    if (matchResult.groups.knot){
        return this.getKnotFoldRange(session, foldStyle, row, line)
    }
    else{
        return this.getStitchFoldRange(session, foldStyle, row, line)
    }
};

this.getKnotFoldRange = function(session, foldStyle, row, line){

    // Collect all text into the fold until you get to a knot

    var endLineRegex = /^(\s*)(={2,})(\s*)((?:function)?)(\s*)(\w+)(\s*)(\([\w,\s->]*\))?(\s*)((?:={1,})?)/
    return this.getRangeFromStartToRegex(session, foldStyle, row, line, endLineRegex)
}

this.getStitchFoldRange = function(session, foldStyle, row, line){

    // Collect all text into the fold until you get to a knot or a stitch

    var endLineRegex = /^(\s*)(={1,})(\s*)((?:function)?)(\s*)(\w+)(\s*)(\([\w,\s->]*\))?(\s*)((?:={1,})?)/
    return this.getRangeFromStartToRegex(session, foldStyle, row, line, endLineRegex)
}

this.getRangeFromStartToRegex = function(session, foldStyle, row, line, regex){

    // Start from the end of the first line, then check every line until the RegEx is found, 
    // or until you get to the end of the text editor. 

    var startRow = row;
    var startCol = line.length
    var endRow = row;
    var maxRow = session.getLength()
    while (endRow < maxRow){
        endRow++;
        var regexLine = session.getLine(endRow).match(regex);
        if (regexLine){
            break;
        }
    }
    
    // Make sure we don't include the RegEx line in the fold. 

    if (startRow != endRow){
        endRow -= 1;
    }

    var endCol = session.getLine(row).length;
    var range = new Range(startRow, startCol, endRow, endCol);
    range = this.removeWhitespaceFromRange(session, range)
    return range;
}

this.removeWhitespaceFromRange = function(session, range){

    // Remove empty lines from the range of text. 

    var endRow = range.end.row
    while (session.getLine(endRow)===""){
        endRow -= 1
    }
    range.end.row = endRow;
    range.end.column = session.getLine(endRow).length;
    return range
}
}).call(FoldMode.prototype);

});

// INK

ace.define("ace/mode/ink",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/javascript_highlight_rules","ace/mode/matching_brace_outdent","ace/worker/worker_client","ace/mode/behaviour/cstyle","ace/mode/folding/cstyle","ace/range","ace/mode/folding/fold_mode"], function(require, exports, module){"use strict";
var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
// var JavaScriptHighlightRules = require("./javascript_highlight_rules").JavaScriptHighlightRules;
// var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
// var WorkerClient = require("../worker/worker_client").WorkerClient;
// var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
// var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var Range = require("../range").Range;
var BaseFoldMode = require("./folding/fold_mode").FoldMode;
// oop.inherits(FoldMode, BaseFoldMode);

var inkHighlightRules = function() {
  // regexp must not have capturing parentheses. Use (?:) instead.
  // regexps are ordered -> the first match is used

  this.$rules = {
      start: [{
          include: "#escapes"
      }, {
          include: "#comments"
      }, {
          regex: /^(\s*)(={2,})(\s*)((?:function)?)(\s*)(\w+)(\s*)(\([\w,\s->]*\))?(\s*)((?:={1,})?)/,
          token: [
              "",
              "flow.knot.declaration.punctuation",  // ===
              "flow.knot.declaration",              // whitespace
              "flow.knot.declaration.function",     // function (optional)
              "flow.knot.declaration",              // whitespace
              "flow.knot.declaration.name",         // knot_name
              "flow.knot.declaration",              // whitespace
              "flow.knot.declaration.parameters",   // (arg1, arg2)
              "flow.knot.declaration",              // whitespace
              "flow.knot.declaration.punctuation"   // ====
          ]
      }, {
          regex: /^(\s*)(=)(\s*)(\w+)(\s*)(\([\w,\s->]*\))?/,
          token: [
              "flow.stitch.declaration",             // whitespace
              "flow.stitch.declaration.punctuation", // =
              "flow.stitch.declaration",             // whitespace
              "flow.stitch.declaration.name",        // stitch_name
              "flow.stitch.declaration",             // whitespace
              "flow.stitch.declaration.parameters"   // parameters
          ]
      }, {
          include: "#statements"
      }],
      "#TODO": [{
          regex: /^(\s*)(TODO\b)(.*)/,
          token: [
              "todo",         // whitespace
              "todo.TODO",    // TODO
              "todo"          // user text
          ]
      }],
      "#choice": [{
          regex: /^(\s*)((?:[\*\+]\s?)+)(\s*)(?:(\(\s*)(\w+)(\s*\)))?/,
          token: [
              "choice",                           // whitespace
              "choice.bullets",                   // * or +
              "choice",                           // whitespace
              "choice.label",                     // ( 
              "choice.label.name",                // label_name
              "choice.label"                      // )
          ],

          // Sub section within choice
          push: [{
              token: "choice",
              regex: /$/,
              next: "pop"
          }, {
              token: "choice.weaveBracket", 
              regex: /\s*\[\s*/,                  // [ weave start 
              push: [{ 
                  token: "choice.weaveBracket", 
                  regex: /\s*\]\s*/,              // ] weave end 
                  next: "start"
              }, {
                  include: "#inlineContent" 
              }, {
                  defaultToken: "choice.weaveInsideBrackets" 
              }]
          }, {
              include: "#choice"
          }, {
              include: "#gather"
          }, {
              include: "#mixedContent"
          }, {
              include: "#comments"
          }, {
              defaultToken: "choice"
          }]
      }],
      "#escapes": [{
          token: "escape",
          regex: /\\[\[\]()\\~{}\/#*+-]/  // backslash escape sequences (e.g. \\ or \[ or \] or \~ or \#)
      }],
      "#comments": [{
          token: "punctuation.definition.comment.json",
          regex: /\/\*\*/,            // /** comment block
          push: [{
              token: "punctuation.definition.comment.json",
              regex: /\*\//,          // end comment block */
              next: "pop"
          }, {
              defaultToken: "comment.block.documentation.json"
          }]
      }, {
          token: "punctuation.definition.comment.json",
          regex: /\/\*/,              // /* comment block 
          push: [{
              token: "punctuation.definition.comment.json",
              regex: /\*\//,          // end comment block */
              next: "pop"
          }, {
              defaultToken: "comment.block.json"
          }]
      }, {
          token: [
              "punctuation.definition.comment.json",
              "comment.line.double-slash.js"
          ],
          regex: /(\/\/)(.*$)/        // // comment
      }],

      // Try different types of divert in sequence, since it's a bit complicated
      // to try to do it in one expression!
      // It's partly complicated because we need to parse it fairly accurately in
      // order to find the divert targets for hyperlinking.
      "#divert": [{
          // -> DONE|END
          regex: /(->|<-)(\s*)(DONE|END)(\s*)/,
          token: [
              "divert.operator",      // ->
              "divert",               // whitespace
              "divert.to-special",    // DONE / END
              "divert"               // whitespace
          ]
      }, {
          // Tunnel onwards
          regex: /(->->)(\s*)(\w[\w\.\s]*)/,
          token: [
              "divert.to-tunnel",      // ->->
              "divert",                // whitespace
              "divert.target"          // target.name
          ]
      }, {
          // Divert with parameters: -> knot (param, -> param2)
          regex: /(->|<-)(\s*)(\w[\w\.\s]*?)(\s*)(\()/,
          token: [
              "divert.operator",  // ->
              "divert",           // whitespace
              "divert.target",    // target.name
              "divert",           // whitespace
              "divert.operator",  // (
          ],
          push: [{
              // Divert target, as parameter to the current divert
              regex: /(->)(\s*)(\w[\w\.\s]*?)(\s*)(?![\w\.])/,
              token: [
                  "divert.parameter.operator",  // ->
                  "divert.parameter",           // whitespace
                  "divert.target",              // target.name
                  "divert.parameter"            // whitespace
              ]
          }, {
              // Explicitly parse function calls so that the close bracket
              // doesn't accidentally get parsed as the end of the parameters
              include: "#functionCallInDivertParameter"
          }, {
              regex: /\)/,
              token: "divert.parameter.operator",
              next: "pop"
          }, {
              defaultToken: "divert.parameter"
          }]
      }, {
          // Vanilla divert
          regex: /(->|<-)(\s*)(\w[\w\.\s]*?)(\s*)(?![\w\.])/,
          token: [
              "divert.operator",  // -> | <-
              "divert",           // whitespace
              "divert.target",    // target.name
              "divert"            // whitespace
          ]
      }, {
          // Divert to gather/choice point, or end of tunnel divert
          regex: /->/,
          token: "divert.operator"
      }],

      // Used to parse function calls within divert parameters so that
      // the closing bracket doesn't accidentally cause the rule to end early. 
      // Having it as a separate rule also allows it to be recursive.
      "#functionCallInDivertParameter": [{
          regex: /\w+\s*\(/,
          token: "divert.parameter",
          push: [{
              "include": "#functionCallInDivertParameter"
          }, {
              regex: /\)/,
              token: "divert.parameter",
              next: "pop"
          }, {
              defaultToken: "divert.parameter"
          }]
      }],

      "#gather": [{
          regex: /^(\s*)((?:-(?!>)\s*)+)/,
          token: [
              "gather",         // whitespace
              "gather.bullets", // - - 
          ],
          push: [{
              regex: /$/,
              token: "gather",
              next: "pop"
          }, {
              include: "#escapes"
          }, {
              include: "#gather"
          }, {
              include: "#comments"
          }, {
              include: "#logicLineInsert"
          }, {
              regex: /(\(\s*)(\w+)(\s*\)\s*)/,
              token: [
                  "gather.label",      // (
                  "gather.label.name", // label_name
                  "gather.label"       // )
              ],
          }, {
              include: "#choice"
          }, {
              include: "#mixedContent"
          }, {
              defaultToken: "gather.innerContent"
          }]
      }],

      "#globalVAR": [{
          regex: /^(\s*)(VAR|CONST)\b/, // (\s*)(\w+)(\s*)
          token: [
              "var-decl", // whitespace
              "var-decl.keyword"
          ],
          
          push: [{
              regex: /(\s*)(\w+)(\s*)/,
              token: [
                  "var-decl",      // whitespace
                  "var-decl.name", // var_name
                  "var-decl"       // whitespace
              ]
          }, 

          // The rest of the assignment line
          { 
              regex: /$/,
              token: "var-decl",
              next: "pop"
          }, {
              include: "#comments"
          }, {
              defaultToken: "var-decl"
          }]
      }],

      "#listDef": [{
          regex: /^(\s*)(LIST)\b/,
          token: [
              "list-decl", // whitespace
              "list-decl.keyword"
          ],
          
          push: [{
              regex: /(\s*)(\w+)(\s*)/,
              token: [
                  "list-decl",      // whitespace
                  "list-decl.name", // var_name
                  "list-decl"       // whitespace
              ]
          }, 

          // The rest of the assignment line
          { 
              regex: /$/,
              token: "list-decl",
              next: "pop"
          }, {
              include: "#comments"
          }, {
              defaultToken: "list-decl"
          }]
      }],

      "#INCLUDE": [{
          regex: /(\s*)(INCLUDE\b)/,
          token: [
              "include",
              "include.keyword"
          ],

          push: [{
              regex: /(\s*)([^\r\n]+)/,
              token: [
                  "include", // whitespace
                  "include.filepath"
              ]
          }, 

          // The rest of the assignment line
          { 
              regex: /$/,
              token: "include",
              next: "pop"
          }, {
              defaultToken: "include"
          }]
      }],

      "#EXTERNAL": [{
          regex: /(\s*)(EXTERNAL\b)/,
          token: [
              "external",
              "external.keyword"
          ],

          // The rest of the external line until a newline
          push: [{
              regex: /(\s*)(\w+)(\([\w,\s->]*\))?/,
              token: [
                  "external", // whitespace
                  "external.declaration.name", //function name
                  "external.declaration.parameters" //function parameters

              ]
          }, 
          { 
              regex: /$/,
              token: "external",
              next: "pop"
          }, {
              defaultToken: "external"
          }]
      }],

      "#inlineConditional": [{
          regex: /(\{)([^:\|\}]+:)/,
          token: [
              "logic.punctuation",
              "logic.inline.conditional.condition"
          ],
          push: [{
              token: "logic.inline.conditional.punctuation",
              regex: /\}/,
              next: "pop"
          }, {
              token: "logic.inline.conditional.punctuation",
              regex: /\|/
          }, {
              include: "#mixedContent"
          }, {
              defaultToken: "logic.inline.innerContent"
          }]
      }],
      "#inlineSequence": [{
          regex: /(\{)(\s*)((?:~|&|!|\$)?)(?=[^\|\}]*\|)/, // Try look ahead to make sure there's a pipe char
          token: [
              "logic.punctuation", // {
              "logic.sequence", // whitespace
              "logic.sequence.operator" // sequence type char (~&!$)
          ],
          push: [{
              token: "logic.punctuation", // }
              regex: /\}/,
              next: "pop"
          }, {
              token: "logic.sequence.punctuation", // | (but not ||)
              regex: /\|(?!\|)/
          }, {
              include: "#mixedContent"
          }, {
              defaultToken: "logic.sequence.innerContent"
          }]
      }],
      "#inlineLogic": [{
          token: "logic.punctuation",
          regex: /\{/,
          push: [{
              token: "logic.punctuation",
              regex: /\}/,
              next: "pop"
          }, {
              defaultToken: "logic.inline"
          }]
      }],
      "#multiLineLogic": [{
          regex: /^(\s*)(\{)(?:([^}:]+)(:))?(?=[^}]*$)/,
          token: [
              "logic",                                             // whitespace
              "logic.punctuation",                                 // {
              "logic.conditional.multiline.condition",             // optional initial condition
              "logic.conditional.multiline.condition.punctuation"  // :
          ],
          push: [{
              token: "logic.punctuation",                          // }
              regex: /\}/, 
              next: "pop"
          }, {
              regex: /^\s*else\s*\:/,             
              token: "conditional.multiline.else"                  // else :
          }, {
              regex: /^(\s*)(-)(?!>)((?:\s?[^:\{}]+):)?/,
              token: [
                  "logic.multiline.branch",                       // whitespace
                  "logic.multiline.branch.operator",              // - 
                  "logic.multiline.branch.condition"              // 
              ]
          }, {
              include: "#statements"
          }, {
              defaultToken: "logic.multiline.innerContent"
          }]
      }],
      "#logicLine": [{
          token: "logic.tilda",
          regex: /^\s*~\s*/,
          push: [{
              token: "logic.tilda",
              regex: /$/,
              next: "pop"
          }, {
              include: "#escapes"
          }, {
              include: "#comments"
          }, {
              defaultToken: "logic.tilda"
          }]
      }],
      "#logicLineInsert": [{
          token: "logic.tilda",
          regex: /\s*~\s*/,
          push: [{
              token: "logic.tilda",
              regex: /$/,
              next: "pop"
          }, {
              include: "#escapes"
          }, {
              include: "#comments"
          }, {
              defaultToken: "logic.tilda"
          }]
      }],
      "#tags": [{
          // e.g. #tag should be highlighted
          token: "tag",

          // End of tag condition: Note that it's very hard to get
          // this exactly right because because you can do both:
          //
          //   1. # {blue|red|green} {one|two}      
          //   2. {red #red|blue #blue|green #green} 
          //
          // So we can't have "{" or "}" signify the end of a tag
          // since that would break the most common case (1), but
          // the compromise is that it breaks the less usual case (2).
          // (Maybe there's a way to handle this with Ace's push/pop
          //  state/stack based system? I never fully understood how
          //  it works!)
          //
          // Right now we simply assume that tags are always at the
          // of a line unless they're in a choice, in which case we
          // stop parsing the tag at "[" or "]".
          regex: /#[^\[\]$]+/
      }],
      "#inlineContent": [{ 
          include: "#inlineConditional"
      }, {
          include: "#inlineSequence"
      }, {
          include: "#inlineLogic"
      }], 
      "#mixedContent": [{ 
          include: "#inlineContent" 
      }, {
          include: "#divert"
      }, {
          include: "#tags"
      }, {
          token: "glue",
          regex: /<>/
      }],
      "#statements": [{
          include: "#comments"
      }, {
          include: "#escapes"
      }, {
          include: "#TODO"
      }, {
          include: "#globalVAR"
      }, {
          include: "#listDef"
      }, {
          include: "#EXTERNAL"
      }, {
          include: "#INCLUDE"
      }, {
          include: "#choice"
      }, {
          include: "#gather"
      }, {
          include: "#multiLineLogic"
      }, {
          include: "#endOfSection"
      }, {
          include: "#logicLine"
      }, {
          include: "#mixedContent"
      }, {
          include: "#customInstruction"
      }],

      // This will be added when overriden in project settings
      // "#customInstruction": [{
      // }],
  }
  
  this.normalizeRules();
};

inkHighlightRules.metaData = {
  fileTypes: ["ink", "ink2"],
  name: "ink",
  scopeName: "source.ink"
}

oop.inherits(inkHighlightRules, TextHighlightRules);




// Set up the folding rules for ink

var inkFoldingRules = function() {};

oop.inherits(inkFoldingRules, BaseFoldMode);

(function(){

    // Use a regular expression to say which line starts a fold.   

    this.foldingStartMarker =  /^(\s*)(=)(?<knot>={1,})?(\s*)((?:function)?)(\s*)(\w+)(\s*)(\([\w,\s->]*\))?(\s*)((?:={1,})?)/; 

    // Get the range of text that will be included in the fold. 

    // Note - properties of Range : {start : {row, column}, end : {row, column}}
    // Different then the ones provided in Ace documentation

    this.getFoldWidgetRange = function(session, foldStyle, row) {
        var line = session.getLine(row);
        var matchResult = line.match(this.foldingStartMarker)
        
        // Check to see if the we're folding a knot or a stitch is a knot or a stitch. 
        if (matchResult.groups.knot){
            return this.getKnotFoldRange(session, foldStyle, row, line)
        }
        else{
            return this.getStitchFoldRange(session, foldStyle, row, line)
        }
    };

    this.getKnotFoldRange = function(session, foldStyle, row, line){

        // Collect all text into the fold until you get to a knot

        var endLineRegex = /^(\s*)(={2,})(\s*)((?:function)?)(\s*)(\w+)(\s*)(\([\w,\s->]*\))?(\s*)((?:={1,})?)/
        return this.getRangeFromStartToRegex(session, foldStyle, row, line, endLineRegex)
    }

    this.getStitchFoldRange = function(session, foldStyle, row, line){

        // Collect all text into the fold until you get to a knot or a stitch

        var endLineRegex = /^(\s*)(={1,})(\s*)((?:function)?)(\s*)(\w+)(\s*)(\([\w,\s->]*\))?(\s*)((?:={1,})?)/
        return this.getRangeFromStartToRegex(session, foldStyle, row, line, endLineRegex)
    }

    this.getRangeFromStartToRegex = function(session, foldStyle, row, line, regex){

        // Start from the end of the first line, then check every line until the RegEx is found, 
        // or until you get to the end of the text editor. 

        var startRow = row;
        var startCol = line.length
        var endRow = row;
        var maxRow = session.getLength()
        while (endRow < maxRow){
            endRow++;
            var regexLine = session.getLine(endRow).match(regex);
            if (regexLine){
                break;
            }
        }
        
        // Make sure we don't include the RegEx line in the fold. 

        if (startRow != endRow){
            endRow -= 1;
        }

        var endCol = session.getLine(row).length;
        var range = new Range(startRow, startCol, endRow, endCol);
        range = this.removeWhitespaceFromRange(session, range)
        return range;
    }

    this.removeWhitespaceFromRange = function(session, range){

        // Remove empty lines from the range of text. 

        var endRow = range.end.row
        while (session.getLine(endRow)===""){
            endRow -= 1
        }
        range.end.row = endRow;
        range.end.column = session.getLine(endRow).length;
        return range
    }

}).call(inkFoldingRules.prototype);




var InkMode = function(instructionPrefix) {

  // With instruction prefix
  if( instructionPrefix ) {
      var extendedRules = function() {
          this.$rules = new inkHighlightRules().getRules();
          
          var regex = new RegExp("(\\s*)(" + instructionPrefix + ")(.*)");

          this.$rules["#customInstruction"] = [{
              regex: regex,
              token: [
                  "customInstruction",              // whitespace
                  "customInstruction.punctuation",  // prefix
                  "customInstruction"               // user content
              ]
          }];

          this.normalizeRules();
      }

      extendedRules.metaData = inkHighlightRules.metaData
      oop.inherits(extendedRules, TextHighlightRules);

      this.HighlightRules = extendedRules;
  }

  // Standard rules, no instruction prefix
  else {
      this.HighlightRules = inkHighlightRules;
  }

  
  this.foldingRules = new inkFoldingRules();
};
oop.inherits(InkMode, TextMode);

(function() {
  // configure comment start/end characters
  this.lineCommentStart = "//";
  this.blockComment = {start: "/*", end: "*/"};

  this.$id = "ace/mode/ink"

  this.getCompletions = function(state, session, pos, prefix) {
      return keywords.map((keyword) => ({
          caption: keyword,
          value: keyword,
          meta: "Ink Keyword",
      }));
  }
}).call(InkMode.prototype);

exports.Mode = InkMode;

});                (function() {
                    ace.require(["ace/mode/ink"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            