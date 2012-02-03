
var Path = require("path"),
    lib = new (require("./modular"))(__dirname).exports
;

module.exports = function (path, opts) {
    var basedir = "";
    
    if (arguments.length === 1 && typeof path !== "string") {
        opts = path;
        path = "";
    }
    
    if (!path) {
        basedir = lib.util.directoryFromStack(__filename);
    }
    
    return new lib.Modular(Path.join(basedir, path), opts).exports;
};

module.exports.Modular = lib.Modular;
