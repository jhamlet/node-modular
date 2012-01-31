
(function () {
    var PATH = require("path"),
        FS   = require("fs"),
        EXCLUDED_BASENAMES = ["main", "index"],
        EXCLUDE_FILENAME_REGEX = /^\./,
        AutoModule
    ;
    //-----------------------------------------------------------------------
    // Utility functions
    //-----------------------------------------------------------------------
    /**
     * Augment the properties of a receiver object with the those of a
     * supplier object.
     * 
     * @param r {object} receiver
     * @param s {object} supplier
     * @returns {object} returns r (receiver)
     */
    function merge (r, s) {
        Object.keys(s).forEach(function (key) {
            r[key] = s[key];
        });
        return r;
    }
    
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
    function toCamelCase (txt) {
        var words = txt.split(/[\s\-_]/).map(function (w) { return w.toLowerCase(); });
        return words[0] + words.slice(1).map(function (w) {
            return w[0].toUpperCase() + w.slice(1);
        }).join("");
    }
    
    /**
     * 
     * @param src {string|object} optional, a directory path to make into a
     *      module, or the actual module object.
     * @param opts {object} optional, an options object
     * @returns {object} the module object
     */
    function makeModule (src, opts) {
        var dirpath;
        
        if (!arguments.length ||
            (typeof src === "object" && !src.hasOwnProperty("exports"))
        ) {
            opts = src;
            src = null;
        }

        src = src || module.parent;
        opts = opts || {};
        
        if (typeof src !== "string") {
            dirpath = PATH.dirname(src.filename);
            opts.moduleInfo = src;
        }
        else {
            dirpath = src;
        }
        
        return (new AutoModule(dirpath, opts)).make();
    }
    //-----------------------------------------------------------------------
    // Private
    //-----------------------------------------------------------------------
    /**
     * Filter out paths based on our excludes array.
     * @param path {string}
     * @returns {boolean}
     */
    function filterExcludes (path) {
        var excluded = false, excludes;
        
        if ((excludes = this.options.excludes)) {
            excludes.forEach(function (pattern) {
                var isRegExp = pattern instanceof pattern;
                if ((isRegExp && pattern.test(path)) ||
                    pattern === path
                ) {
                    excluded = true;
                    return;
                }
            });
        }
        
        return !excluded;
    }
    
    function filterBasenames (name) {
        return EXCLUDED_BASENAMES.some(function (basename) {
            return basename === name;
        });
    }
    
    /**
     * Filter out certain files based on their basename
     * @param path {string}
     * @returns {boolean}
     */
    function filterFiles (path) {
        var basename = PATH.basename(path, ".js");
        
        return (this.filename && this.filename !== path) ||
            !EXCLUDE_FILENAME_REGEX.test(basename) ||
            !EXCLUDED_BASENAMES.some(function (name) {
                return name === basename;
            });
    }
    //-----------------------------------------------------------------------
    // Public
    //-----------------------------------------------------------------------
    /**
     * @constructor
     * @param filename {string}
     * @param opts {object} options object
     *      @property recurse {boolean}
     *      @property excludes {array}
     */
    makeModule.AutoModule = AutoModule = function (path, opts) {
        var options = (this.options = {});
        
        this.basedir = path;

        merge(options, AutoModule.prototype.DEFAULT_OPTIONS);
        opts = opts && merge(options, opts);
        
        if (options.moduleInfo) {
            this.filename = options.moduleInfo.filename;
        }
    };
    
    merge(AutoModule.prototype, {
        /**
         * @property DEFAULT_OPTIONS
         * @type {object}
         */
        DEFAULT_OPTIONS: {
            /**
             * Whether or not to recursively make modules of sub-directories
             * @property recurse
             * @type {boolean}
             * @default true
             */
            recurse: true,
            /**
             * Function used to transform a filename to a property key
             * @property nameFunction
             * @type {function}
             * @default toCamelCase
             */
            nameFunction: toCamelCase
        },
        /**
         * @method make
         * @returns {object} an object to represent the generated module
         */
        make: function () {
            var root, basedir;
            
            if (this.root) {
                return this.root;
            }

            root = this.root = {};
            basedir = this.basedir;
            
            FS.readdirSync(basedir).map(PATH.join.bind(PATH, basedir)).
                filter(filterExcludes, this).filter(filterFiles, this).
                forEach(this.require, this);
            
            return root;
        },
        
        /**
         * @method require
         * @param path {string} path to file or directory to "require"
         */
        require: function (path) {
            var opts     = this.options,
                basename = PATH.basename(path, ".js"),
                nameFn   = opts.nameFunction,
                propName = nameFn(basename),
                isDir    = FS.statSync(path).isDirectory(),
                root     = this.root
            ;
            
            if (isDir && !opts.recurse) {
                return;
            }
            
            Object.defineProperty(root, propName, {
                get: function () {
                    var mod = isDir ?
                                makeModule(path, opts) :
                                require(path);
                                
                    Object.defineProperty(root, propName, {
                        value: mod,
                        enumerable: true
                    });
                    return mod;
                },
                enumerable: true,
                configurable: true
            });
        }
    });
    
    //-----------------------------------------------------------------------
    // Exports
    //-----------------------------------------------------------------------
    /**
     * We export the utility method so creating an auto-module is relatively
     * straight-forward. i.e:
     * 
     *      var module = require("auto-module")();
     * or,
     *      var module = require("auto-module")(module);
     * or,
     *      var module = require("auto-module")(__dirname);
     */
    module.exports = makeModule;
    
}());
