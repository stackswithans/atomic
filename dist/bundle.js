// USAGE:
// var handlebars = require('handlebars');
/* eslint-disable no-var */

// var local = handlebars.create();

var handlebars = require("../dist/cjs/handlebars")["default"];

var printer = require("../dist/cjs/handlebars/compiler/printer");
handlebars.PrintVisitor = printer.PrintVisitor;
handlebars.print = printer.print;

module.exports = handlebars;

// Publish a Node.js require() handler for .handlebars and .hbs files
function extension(module, filename) {
    var fs = require("fs");
    var templateString = fs.readFileSync(filename, "utf8");
    module.exports = handlebars.compile(templateString);
}
/* istanbul ignore else */
if (typeof require !== "undefined" && require.extensions) {
    require.extensions[".handlebars"] = extension;
    require.extensions[".hbs"] = extension;
}

undefined("on", function (event, handler) {
    const { __instanceId } = this;
    handler = typeof handler === "string" ? handler : null;
    return new undefined(
        `data-atomic-on=${JSON.stringify({
            event,
            instanceId: __instanceId,
            handler,
        })}`
    );
});
undefined("bind", function (event, handler) {
    const { __instanceId } = this;
    handler = isType(handler, "string") ? handler : null;
    return new undefined(
        `data-atomic-on=${JSON.stringify({
            event,
            instanceId: __instanceId,
            handler,
        })}`
    );
});
const isType = (obj, type) => typeof obj === type;
