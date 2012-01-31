/*globals suite, setup, test*/

var should = require("should");

suite("AutoModule Test #1", function () {
    var mod = require("./test-mod");
    
    test("Module should be an object", function () {
        should.exist(mod);
    });
    
    test("Module properties should be getters before access", function () {
        var propDesc;
        
        propDesc = Object.getOwnPropertyDescriptor(mod, "foo");
        propDesc.get.should.be.a("function");
        
        ["baz", "buz"].forEach(function (name) {
            propDesc = Object.getOwnPropertyDescriptor(mod.bar, name);
            propDesc.get.should.be.a("function");
        });
    });
    
    test("Module property values are correct", function () {
        mod.foo.should.equal("foo");
        mod.bar.baz.should.equal("baz");
        mod.bar.buz.should.equal("buz");
    });
    
    test("Module properties should not be getters after access", function () {
        var propDesc;
        
        propDesc = Object.getOwnPropertyDescriptor(mod, "foo");
        propDesc.should.not.have.property("get");
        propDesc.value.should.be.a("string");
        
        ["baz", "buz"].forEach(function (name) {
            propDesc = Object.getOwnPropertyDescriptor(mod.bar, name);
            propDesc.should.not.have.property("get");
            propDesc.value.should.be.a("string");
        });
    });
});
