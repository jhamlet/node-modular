Modular
=======

**Modular** allows simple exportation of a module directory to a node module structure. Individual files are only required when the exported object's property is accessed.

Installation
------------

    % npm install -g auto-module


Usage
-----

A `require("modular")` returns a function that takes two *optional* arguments.

~~~js
module.exports = require("modular")([src], [options]);
~~~

`src`, if given, should be a string that is a path to a directory to turn into an **Modular**. If not given, the directory of the file that required **Modular** will be used.

`options`, if given, should be an object with one, or more, of the following properties:

*   `recursive`: Whether or not to recursively turn sub-directories into **Modulars** also. Default is `true`.
*   `keyFormatter`: A function to use to transform a filename into a property key. The default is to camel-case the file name by splitting the base filename (minus any extension) on whitespace or a hyphen, and then title case all words after first. i.e:

        "my-foo-function" => "myFooFunction"
        "My-Base-Class" => "MyBaseClass"
        "-my-other-class" => "MyOtherClass"
        
*   `excludes`: An array of strings, or *Regular Expressions*, to use to exclude certain files. The exclude pattern will be applied to a file's *basename*.


Example
-------

Given the following directory structure:

~~~
my-module/
    index.js
    foo.js
    foo-bar/
        Baz.js
        buz.js
~~~

If the content of `my-module/index.js` is the following:

~~~js
module.exports = require("modular")();
~~~

Would produce the following module/object structure:

~~~js
{
    foo: {
        // the exports of my-module/foo.js
    },
    fooBar: {
        Baz: {
            // the exports of my-module/Baz.js
        },
        buz: {
            // the exports of my-module/buz.js
        }
    }
}
~~~

But, not really.

The actual property is not resolved (the underlying file `required`) until it is accessed. So, really, when first required the exported object looks like this:

~~~js
{
    foo: [Getter],
    fooBar: [Getter]
}
~~~

After `foo` and `fooBar` are accessed, it would look like this:

~~~js
{
    foo: {
        // the exports of my-module/foo.js
    },
    fooBar: {
        Baz: [Getter],
        buz: [Getter]
    }
}
~~~

And so on.

