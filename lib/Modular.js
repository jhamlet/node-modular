
var Proteus = require("proteus"),
    Path    = require("path"),
    FS      = require("fs"),
    Util    = require("util"),
    toCamelCase = require("./util").toCamelCase,
    EXCLUDE_FILES_REGEX = /^(index|main)\.js$/i,
    DEFAULT_OPTIONS = {
        /**
         * Turn directories into Modulars too?
         * @property recursive
         * @type {boolean}
         * @default true
         */
        recursive: true,
        /**
         * Function used to format a file name to a property key
         * @property keyFormatter
         * @type {function}
         * @default toCamelCase
         */
        keyFormatter: toCamelCase,
        /**
         * File name patterns to exclude
         * @property excludes
         * @type {array[string|RegExp]}
         */
        // excludes: []
    },
    Modular
;
//---------------------------------------------------------------------------
// Utility
//---------------------------------------------------------------------------
function nameMatchesPattern (filename, pattern) {
    if (Util.isRegExp(pattern)) {
        return pattern.test(filename);
    }
    return pattern === filename;
}
//---------------------------------------------------------------------------
// Private
//---------------------------------------------------------------------------
/**
 * Build the underlying object with the module structure
 * @private
 */
function buildModule () {
    var basedir = this.path;
    
    FS.readdirSync(basedir).
        filter(function (name) {
            var dot = /^\./.test(name),
                dir = FS.statSync(Path.join(basedir, name)).isDirectory(),
                exclude = !(/\.js$/i.test(name)) ||
                    EXCLUDE_FILES_REGEX.test(name)
            ;
            
            return !dot && (
                (dir && this.options.recursive) || !exclude
            );
        }, this).
        filter(this.isIncluded, this).
        forEach(this.require, this);
}
//---------------------------------------------------------------------------
// Public
//---------------------------------------------------------------------------
module.exports = Modular = Proteus.Class.derive({
    
    init: function (path, opts) {
        var options = (this.options = {}),
            root
        ;
        
        this.path = path;
        
        Proteus.merge(options, DEFAULT_OPTIONS);
        if (opts) {
            Proteus.merge(options, opts);
        }

        Proteus.defineGetter(this, "root", function () {
            if (!root) {
                root = {};
                buildModule.call(this);
            }
            return root;
        });
    },
    
    isIncluded: function (filename) {
        return !this.isExcluded(filename);
    },
    
    isExcluded: function (filename) {
        var excludes = this.options.excludes;
        if (excludes) {
            return excludes.some(nameMatchesPattern.bind(this, filename));
        }
        return false;
    },
    
    require: function (filename) {
        var opts     = this.options,
            path     = this.path,
            filepath = Path.join(path, filename),
            nameFn   = opts.keyFormatter,
            propName = nameFn(Path.basename(filename, ".js")),
            isDir    = FS.statSync(filepath).isDirectory(),
            root     = this.root
        ;
        
        Object.defineProperty(root, propName, {
            get: function () {
                var mod = isDir ?
                            new Modular(filepath, opts).exports :
                            require(filepath);
                            
                Object.defineProperty(root, propName, {
                    value: mod,
                    enumerable: true
                });
                return mod;
            },
            enumerable: true,
            configurable: true
        });
    },
    
    get exports () {
        return this.root;
    }
    
});
