var Path = require("path");

module.exports = {
    /**
     * Convert a string to a camel-cased version.  By default the input
     * string is split on whitespace, hyphens, or underscores, and each word
     * after the first is title-cased and then joined together with the
     * first.  i.e:
     * 
     *      "my-name-space" => "myNameSpace"
     *      "My-Class_name" => "MyClassName"
     * 
     * @param txt {string} the string to transform
     * @returns {string}
     */
    toCamelCase: function (txt) {
        var words = txt.split(/[\s\-]/);
        return words[0] + words.slice(1).map(function (w) {
            w = w.toLowerCase();
            return w[0].toUpperCase() + w.slice(1);
        }).join("");
    },
    
    /**
     * Using an error stack, try to determine the calling directory.  If
     * passed the optional *filepath* parameter, use that to determine where
     * to start looking in the stack trace.
     * 
     * @method directoryFromStack
     * @param filepath {string} optional
     * @returns {string}
     */
    directoryFromStack: (function () {
        var STACK_PATH_REGEX = /\(([^:]+)(:\d+)+\)/,
            DEFAULT_STACK_LINE = 3
        ;
        
        return function (filepath) {
            var error = new Error(),
                stack = error.stack.split("\n"),
                match, line, len, i
            ;

            if (filepath) {
                for (i = 1, len = stack.length; i < len; i++) {
                    line = stack[i];
                    if (~line.indexOf(filepath)) {
                        match = STACK_PATH_REGEX.exec(stack[i+1]);
                        break;
                    }
                }
            }
            else {
                match = STACK_PATH_REGEX.exec(stack[DEFAULT_STACK_LINE]);
            }

            return match && Path.dirname(match[1]) || process.cwd();
        };
    }())
};
