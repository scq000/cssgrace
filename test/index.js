var fs = require("fs")

var test = require("tape")

var postcss = require("postcss")
var plugin = require("..")

function filename(name) { return "test/" + name + ".css" }
function read(name) { return fs.readFileSync(name, "utf8") }

function compareFixtures(t, name, msg, opts, postcssOpts) {
  postcssOpts = postcssOpts || {}
  postcssOpts.from = filename("fixtures/" + name)
  opts = opts || {}
  // var actual = postcss().use(plugin(css)).process(read(postcssOpts.from), postcssOpts).css

  console.log('aaa-----',read(postcssOpts.from))
  console.log('bbbs-----',plugin(css))

  var expected = read(filename("fixtures/" + name + ".output"))
  fs.writeFile(filename("fixtures/" + name + ".actual"), actual)
  t.equal(actual.trim(), expected.trim(), msg)
}

test("@meida", function(t) {
  compareFixtures(t, "inline-block", "should transform")

  t.end()
})
