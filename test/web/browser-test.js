(function(){
'use strict';


var expect = chai.expect;



var Json = fav.json;

describe('fav.json', function() {

  describe('stringify', function() {
    it('Should convert an object to a JSON string (1)', function() {
      var json = new Json();
      var text = json.stringify({ a: 1 });
      expect(text).to.equal('{"a":1}');
    });

    it('Should convert an object to a JSON string (2)', function() {
      var date1 = new Date();
      var json = new Json();
      var text = json.stringify({
        a: undefined,
        b: null,
        c: { a: true, b: false },
        d: { a: 0, b: -123, c: 456 },
        e: { a: '', b: 'abc', c: '|DATE|aaa' },
        f: [1, 'A', true],
        g: date1,
      });
      /* eslint max-len: off */
      expect(text).to.equal('{"b":null,"c":{"a":true,"b":false},"d":{"a":0,"b":-123,"c":456},"e":{"a":"","b":"abc","c":"||DATE|aaa"},"f":[1,"A",true],"g":"|Date|' + date1.getTime() + '"}');
    });
  });

  describe('parse', function() {
    it('Should convert a JSON string to an object (1)', function() {
      var json = new Json();
      var obj = json.parse('{"a":1}');
      expect(obj).to.deep.equal({ a: 1 });
    });

    it('Should convert a JSON string to an object (2)', function() {
      var date1 = new Date();
      var json = new Json();
      var obj = json.parse('{"b":null,"c":{"a":true,"b":false},"d":{"a":0,"b":-123,"c":456},"e":{"a":"","b":"abc","c":"||DATE|aaa"},"f":[1,"A",true],"g":"|Date|' + date1.getTime() + '"}');
      expect(obj).to.deep.equal({
        b: null,
        c: { a: true, b: false },
        d: { a: 0, b: -123, c: 456 },
        e: { a: '', b: 'abc', c: '|DATE|aaa' },
        f: [1, 'A', true],
        g: date1,
      });
    });

    it('Should register valid support types', function() {
      function Abc(a) {
        this.a = a;
      }
      Abc.prototype.toJSON = function() {
        return this.a;
      };

      function Def(obj) {
        this.a = obj.a;
      }

      var json = new Json();
      json.supports(Abc)
          .supports(Def);

      var abc = new Abc(123);
      var text = json.stringify(abc);
      expect(text).to.equal('"|Abc|123"');

      var abc2 = json.parse(text);
      expect(abc2).to.deep.equal(new Abc(123));
      expect(abc2 instanceof Abc).to.equal(true);

      var def = new Def({ a: 456 });
      var text = json.stringify({ x: abc, y: def });
      expect(text).to.equal('{"x":"|Abc|123","y":"|Def|{\\"a\\":456}"}');

      var obj2 = json.parse(text);
      expect(obj2.x instanceof Abc).to.equal(true);
      expect(obj2.y instanceof Def).to.equal(true);
      expect(obj2.x).to.deep.equal(new Abc(123));
      expect(obj2.y).to.deep.equal(new Def({ a: 456 }));
    });

    it('Should register invalid support types', function() {
      function Abc(a) {
        this.a = a;
      }
      Abc.prototype.toJSON = function() {
        return this.a;
      };

      function Def(obj) {
        this.a = obj.a;
      }

      var json = new Json();
      json.supports(Abc, 'replacer', 'reviver')
          .supports('Def');

      var abc = new Abc(123);
      var text = json.stringify(abc);
      expect(text).to.equal('123');
      expect(json.parse(text)).to.equal(123);

      var def = new Def({ a: 456 });
      var text = json.stringify({ x: abc, y: def });
      expect(text).to.equal('{"x":123,"y":{"a":456}}');
      expect(json.parse(text)).to.deep.equal({ x: 123, y: { a: 456 } });
    });
  });
});

})();
