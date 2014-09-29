var should = require('should')
var heredoc = require('heredoc')
var parser = require('../')

describe('css process', function() {
  it('center parse', function() {
    var input = heredoc(function() {/*
.foo {
  position: center;
  width: 300px;
  height: 53rem;
}
    */})

    var output = heredoc(function() {/*
.foo {
  position: absolute;
  width: 300px;
  height: 53rem;
  margin-left: -150px;
  margin-top: -26.5rem;
  top: 50%;
  left: 50%;
}
    */})

    should(parser(input)).be.exactly(output)
  })
})
