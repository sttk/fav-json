'use strict';

var chai = require('chai');
var expect = chai.expect;

var replacer = require('../../lib/replacer');

replacer = replacer.bind({
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
      name: 'Abc',
      replace: function(abc) {
        return JSON.stringify(abc);
      },
      revive: function(obj) {
        return new Abc(obj.a, obj.b, obj.c);
      },
    },

    'String': { name: 'String', replace: error, revive: error },
    'Number': { name: 'Number', replace: error, revive: error },
    'Boolean': { name: 'Boolean', replace: error, revive: error },
    'Array': { name: 'Array', replace: error, revive: error },
    'Object': { name: 'Object', replace: error, revive: error },
    'Symbol': { name: 'Symbol', replace: error, revive: error },
    'Function': { name: 'Function', replace: error, revive: error },
    'Null': { name: 'Null', replace: error, revive: error },
    'Undefined': { name: 'Undefined', replace: error, revive: error },
  },
});

function error() {
  throw new Error('Replacer error');
}

function Abc(a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
}

describe('lib/replacer', function() {
  it('Should not replace when type is not either an object or an array',
  function() {
    expect(replacer('', undefined)).to.equal(undefined);
    expect(replacer('', null)).to.equal(null);
    expect(replacer('', true)).to.equal(true);
    expect(replacer('', false)).to.equal(false);
    expect(replacer('', 0)).to.equal(0);
    expect(replacer('', 123)).to.equal(123);
    expect(replacer('', -0.123)).to.equal(-0.123);
    expect(replacer('', '')).to.equal('');
    expect(replacer('', 'abc')).to.equal('abc');
    expect(replacer('', '|abc')).to.equal('|abc');

    if (typeof Symbol === 'function') {
      var symbol = Symbol('a');
      expect(replacer('', symbol)).to.equal(symbol);
    }

    function fn() {}
    expect(replacer('', fn)).to.equal(fn);
  });

  it('Should not replace an object which contains only null', function() {
    expect(replacer('', { a: null })).to.deep.equal({ a: null });
    expect(replacer('', [null])).to.deep.equal([null]);
  });

  it('Should not replace an object which contains only undefined', function() {
    expect(replacer('', { a: undefined })).to.deep.equal({ a: undefined });
    expect(replacer('', [undefined])).to.deep.equal([undefined]);
  });

  it('Should not replace an object which contains only boolean', function() {
    var a = { a: true, b: false };
    expect(replacer('', a)).to.deep.equal(a);

    expect(replacer('', [true, false])).to.deep.equal([true, false]);
  });

  it('Should not replace an object which contains only number', function() {
    var a = { a: 0, b: 123, c: -0.123 };
    expect(replacer('', a)).to.deep.equal(a);

    a = [0, 123, -0.123];
    expect(replacer('', a)).to.deep.equal(a);
  });

  it('Should not replace an object which contains only a string not starting' +
  '\n\twith "|"', function() {
    var a = { a: '', b: 'abc' };
    expect(replacer('', a)).to.deep.equal(a);
  });

  it('Should replace an object which contains a string starting with "|"',
  function() {
    var a = { a: '', b: '|abc', c: 'abc' };
    expect(replacer('', a)).to.deep.equal({ a: '', b: '||abc', c: 'abc' });
  });

  it('Should not replace an Array which does not contains elements needed to' +
  '\n\tconvert', function() {
    var a = [];
    expect(replacer('', a)).to.deep.equal(a);

    a = [1, 2, 3];
    expect(replacer('', a)).to.deep.equal(a);

    a = ['', 'abc', 'def'];
    expect(replacer('', a)).to.deep.equal(a);
  });

  it('Should replace an Array which contains elements needed to convert',
  function() {
    var a = ['', '|abc', 'def'];
    expect(replacer('', a)).to.deep.equal(['', '||abc', 'def']);
  });

  it('Should not replace an object which contains only an Array', function() {
    expect(replacer('', { a: [] })).to.deep.equal({ a: [] });
    expect(replacer('', { a: [1, 2, 3] })).to.deep.equal({ a: [1, 2, 3] });

    var a = { a: ['', 'abc', '|def'] };
    expect(replacer('', a)).to.deep.equal(a);
  });

  it('Should replace an object which contains Date', function() {
    var d0 = new Date();
    var a = { a: d0 };
    var b = { a: '|Date|' + d0.getTime() };
    expect(replacer('', a)).to.deep.equal(b);
  });

  it('Should replace an object which contains a supported user-defined type',
  function() {
    var abc = new Abc(123, '|abc', true);
    var d0 = { d: abc };
    var d1 = replacer('', d0);
    expect(d1.d instanceof Abc).to.equal(false);
    expect(d1).to.deep.equal({ d: '|Abc|{"a":123,"b":"|abc","c":true}' });
  });

  it('Should replace an object which contains a supported user-defined type',
  function() {
    var fn = function() {};
    function Aaa(a) {
      this.a = a;
    }
    var abc = new Abc(1, 2, 3);
    var aaa = new Aaa(4);
    var obj = { a: 1, b: 'B', c: true };

    var o0 = {
      p0: undefined,
      p1: null,
      p2: true,
      p3: 123,
      p4: fn,
      p5: abc,
      p6: aaa,
      p7: obj,
      p8: 'XXX',
      p9: '|YYY',
      p10: [1, 2, 3],
    };

    var symbol = 'SYMBOL';
    if (typeof Symbol === 'function') {
      symbol = Symbol('a');
    }
    o0.p11 = symbol;

    var o1 = replacer('', o0);
    var o2 = {
      p0: undefined,
      p1: null,
      p2: true,
      p3: 123,
      p4: fn,
      p5: '|Abc|{"a":1,"b":2,"c":3}',
      p6: aaa,
      p7: obj,
      p8: 'XXX',
      p9: '||YYY',
      p10: [1, 2, 3],
    };
    o2.p11 = symbol;
    expect(o1).to.deep.equal(o2);
  });

  it('Should not replace an object which contains a unsupported user-defined' +
  '\n\ttype', function() {
    function Abc2(a) {
      this.a = a;
    }
    var abc2 = new Abc2('|abc');
    var d0 = { d: abc2 };
    var d1 = replacer('', d0);
    expect(d1).to.equal(d0);
    expect(d1).to.deep.equal({ d: { a: '|abc' } });
  });
});
