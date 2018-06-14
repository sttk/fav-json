'use strict';

var chai = require('chai');
var expect = chai.expect;

var reviver = require('../../lib/reviver');

reviver = reviver.bind({
  supportedTypes: {
    'Date': {
      replace: function(date) {
        return date.getTime();
      },
      revive: function(n) {
        return new Date(n);
      },
    },
    'Abc': {
      replace: function(abc) {
        return JSON.stringify(abc);
      },
      revive: function(obj) {
        return new Abc(obj.a, obj.b, obj.c);
      },
    },

    'String': { replace: error, revive: error },
    'Number': { replace: error, revive: error },
    'Boolean': { replace: error, revive: error },
    'Array': { replace: error, revive: error },
    'Object': { replace: error, revive: error },
    'Symbol': { replace: error, revive: error },
    'Function': { replace: error, revive: error },
    'Null': { replace: error, revive: error },
    'Undefined': { replace: error, revive: error },
  },
});

function error() {
  throw new Error('Revive error');
}

function Abc(a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
}

describe('lib/reviver', function() {

  it('Should revive a null', function() {
    expect(reviver('', null)).to.equal(null);
  });

  it('Should revive a number', function() {
    expect(reviver('', 0)).to.equal(0);
    expect(reviver('', 123)).to.equal(123);
  });

  it('Should revive a string', function() {
    expect(reviver('', '')).to.equal('');
    expect(reviver('', 'abc')).to.equal('abc');
  });

  it('Should revive a string starting with "|"', function() {
    expect(reviver('', '|')).to.equal('|');
    expect(reviver('', '|abc')).to.equal('|abc');
  });

  it('Should revive a string starting with "||"', function() {
    expect(reviver('', '||')).to.equal('|');
    expect(reviver('', '||abc')).to.equal('|abc');
  });

  it('Should revive a string which is a typed text : Date', function() {
    var d0 = new Date();
    var d1 = reviver('', '|Date|' + d0.getTime());
    expect(d1 instanceof Date);
    expect(d1.getTime()).to.equal(d0.getTime());
  });

  it('Should revive a string which is a typed text : User-defined type',
  function() {
    var abc0 = new Abc(11, 22, 33);
    var abc1 = reviver('', '|Abc|' + JSON.stringify(abc0));
    expect(abc1 instanceof Abc);
    expect(abc1.a).to.equal(11);
    expect(abc1.b).to.equal(22);
    expect(abc1.c).to.equal(33);
  });

  it('Should revive a string which is a typed text : Unsupported type',
  function() {
    function Def(a) {
      this.a = a;
    }
    var def0 = new Def(11);
    var def1 = reviver('', '|Def|' + JSON.stringify(def0));
    expect(def1).to.equal('|Def|{"a":11}');
  });

  it('Should not revive a specific type object even if registered',
  function() {
    expect(reviver('', '|String|' + JSON.stringify('a')), '|String|"a"');
    expect(reviver('', '|Array|' + JSON.stringify('a')), '|Array|"a"');
    expect(reviver('', '|Object|' + JSON.stringify('a')), '|Object|"a"');
    expect(reviver('', '|Number|' + JSON.stringify('a')), '|Number|"a"');
    expect(reviver('', '|Boolean|' + JSON.stringify('a')), '|Boolean|"a"');
    expect(reviver('', '|Null|' + JSON.stringify('a')), '|Null|"a"');
    expect(reviver('', '|Undefined|' + JSON.stringify('a')), '|Undefined|"a"');
    expect(reviver('', '|Symbol|' + JSON.stringify('a')), '|Symbol|"a"');
    expect(reviver('', '|Function|' + JSON.stringify('a')), '|Function|"a"');
  });

});
