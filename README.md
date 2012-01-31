AutoModule
==========

**AutoModule** allows simple exportation of a module directory to a node module structure. Individual files are only required when the exported object's property is accessed.

Installation
------------

    % npm install -g auto-module


Usage
-----

A `require("auto-module")` returns a function that takes two *optional* arguments.

~~~js
module.exports = require("auto-module")([src], [options]);
~~~

`src`, if given, should be a string that is a path to a directory to turn into an **AutoModule**. If not given, the directory of the file that required **AutoModule** will be used.

`options`, if given, should be an object with one, or more, of the following properties:

*   `recurse`: Whether or not to recursively turn sub-directories into **AutoModules** also. Default is `true`.
*   `formatter`: A function to use to transform a filename into a property key. The default is to camel-case the file name by splitting the base filename (minus any extension) on a space, hyphen, or underscore, and then title casing all words but the first. i.e:

        "my-foo-function" => "myFooFunction"
        "My_Base-Class" => "MyBaseClass"
        "_my-other-class" => "MyOtherClass"
        
*   `excludes`: An array of strings, or *Regular Expressions*, to use to exclude certain files. The exclude pattern will be applied to a files *basename*.


Example
-------

Given the following directory structure:

~~~
my-module/
    index.js
    foo.js
    bar/
        baz.js
        buz.js
~~~

If the content of `my-module/index.js` is the following:

~~~js
module.exports = require("auto-module")();
~~~

Would produce the following module/object structure:

~~~js
{
    foo: {
        // the exports of my-module/foo.js
    },
    bar: {
        baz: {
            // the exports of my-module/baz.js
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
    bar: [Getter]
}
~~~

After `foo` and `bar` are accessed, it would look like this:

~~~js
{
    foo: {
        // the exports of my-module/foo.js
    },
    bar: {
        baz: [Getter],
        buz: [Getter]
    }
}
~~~

And so on.

