# [@fav/json][repo-url] [![NPM][npm-img]][npm-url] [![MIT License][mit-img]][mit-url] [![Build Status][travis-img]][travis-url] [![Build Status][appveyor-img]][appveyor-url] [![Coverage status][coverage-img]][coverage-url]

Creates a JSON converter which supports not only primitive types but also any object types.

> "fav" is an abbreviation of "favorite" and also the acronym of "for all versions".
> This package is intended to support all Node.js versions and many browsers as possible.
> At least, this package supports Node.js >= v0.10 and major Web browsers: Chrome, Firefox, IE11, Edge, Vivaldi and Safari.

## Install

To install from npm:

```sh
$ npm install --save @fav/json
```

***NOTE:*** *npm < 2.7.0 does not support scoped package, but even old version Node.js supports it. So when you use such older npm, you should download this package from [github.com][repo-url], and move it in `node_modules/@fav/json/` directory manually.*


## Usage

For Node.js:

```js
var Json = require('@fav/json');
var json = new Json();

function Aaa(a) { this.a = a; }
Aaa.prototype.toJSON = function() { return this.a; }

function Bbb(obj) { this.b = obj.b; }

function Ccc(a, b, c) { this.a = a; this.b = b; this.c = c; }
var replacer = function(ccc) {
  return JSON.stringify({ a: ccc.a, b: ccc.b, c: ccc.c });
};
var reviver = function(ccc) {
  return new Ccc(ccc.a, ccc.b, ccc.c);
};

json.supports(Aaa).supports(Bbb).supports(Ccc, replacer, reviver);

var jsonText = json.stringify({
  aaa: new Aaa(123),
  bbb: new Bbb({ b: 'BBB' }),
  ccc: new Ccc(987, 'CCC', true),
  ddd: new Date(1528988400000),  // 2018-06-14T15:00:00.000Z
});
// => '{"aaa":"|Aaa|123","bbb":"|Bbb|{\\"b\\":\\"BBB\\"}","ccc":"|Ccc|{\\"a\\":987,\\"b\\":\\"CCC\\",\\"c\\":true}","ddd":"|Date|1528988400000"}'

var jsonObj = json.parse(jsonText);
// => { aaa: Aaa { a: 123 },
  bbb: Bbb { b: 'BBB' },
  ccc: Ccc { a: 987, b: 'CCC', c: true },
  ddd: 2018-06-14T15:00:00.000Z }
  
jsonObj.aaa instanceof Aaa  // => true
jsonObj.bbb instanceof Bbb  // => true
jsonObj.ccc instanceof Ccc  // => true
jsonObj.ddd instanceof Date // => true
```

For Web browsers:

```html
<script src="fav.json.min.js"></script>
<script>
var Json = fav.json;
var json = new Json();

var jsonText = json.stringify({
  ddd: new Date(1528988400000),  // 2018-06-14T15:00:00.000Z
});
// => '{"ddd":"|Date|1528988400000"}'

var jsonObj = json.parse(jsonText);
// => { ddd: 2018-06-14T15:00:00.000Z }

jsonObj.ddd instanceof Date // => true
</script>
```


## API

### <u>*constructor*() : Json</u>

Creates a Json object. 

### <u>.supports(constructor [, replacer, reviver]) : Json</u>

Accepts a *constructor*, *replacer* (optional) and *reviver* (optional) of a data type to be supported.

A *replacer* is a function of which a parameter is a value of the data type and a returned value is a value which is converted to a JSON string. 
If a *replacer* is not specified, <code><i>value</i>.toJSON()</code> or <code>JSON.stringify(<i>value</i>)</code> is used alternatively.

A *reviver* is a function of which a parameter is a value of the data type and a returned value is a value of the original data type which is revived.
If a *reviver* is not specified, <code>new constructor(<i>value</i>)</code> is used alternatively.

`Date` is supported by default, and it is converted to a JSON string like: `'"|Date|' + date.getTime() + '"'`.

**Parameters:**

| Parameter    |  Type    | Description                                       |
|:-------------|:--------:|:--------------------------------------------------|
| *constructor*| function | The constructor of the data type to be supported. |
| *replacer*   | function | The replacing function. (Optional)                |
| *reviver*    | function | The reviving function. (Optional)                 |

**Return:**

A `Json` object.


### <u>.stringify(value) : string</u>

Converts a parameter value to a JSON string.
The conversions of values, except a string which starts with `'|'`, a `Date` object and an object of type registered with `.supports` method, are same with original conversions. 

A Data object and an object of type registered with `.supports` method are converted to a JSON string like: <code>'"|<i>type</i>|<i>value</i>"'</code>.
And a string which stars with `'|'` is converted a JSON string like: <code>'"||<i>value</i>"'</code> to distinguish it from a JSON string of a value of supported type.

**Parameters:**

| Parameter    |  Type    | Description                                 |
|:-------------|:--------:|:--------------------------------------------|
| *value*      | *Any*    | A value to be converted to a JSON string.   |

**Return:**

A JSON string.

### <u>.parse(text) : Any</u>

Revives a parameter JSON string to an original value which can contain `Date` objects and user-defined type objects.

**Parameters:**

| Parameter    |  Type    | Description                                       |
|:-------------|:--------:|:--------------------------------------------------|
| *text*       | string   | A JSON string to be revived to an original value. |

**Return:**

A JSON string.


## Checked                                                                      

### Node.js (4〜)

| Platform  |   4    |   5    |   6    |   7    |   8    |   9    |   10   |
|:---------:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|
| macOS     |&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|
| Windows10 |&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|
| Linux     |&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|

### io.js (1〜3)

| Platform  |   1    |   2    |   3    |
|:---------:|:------:|:------:|:------:|
| macOS     |&#x25ef;|&#x25ef;|&#x25ef;|
| Windows10 |&#x25ef;|&#x25ef;|&#x25ef;|
| Linux     |&#x25ef;|&#x25ef;|&#x25ef;|

### Node.js (〜0.12)

| Platform  |  0.8   |  0.9   |  0.10  |  0.11  |  0.12  |
|:---------:|:------:|:------:|:------:|:------:|:------:|
| macOS     |&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|
| Windows10 |&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|
| Linux     |&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|&#x25ef;|

### Web browsers

| Platform  | Chrome | Firefox | Vivaldi | Safari |  Edge  | IE11   |
|:---------:|:------:|:-------:|:-------:|:------:|:------:|:------:|
| macOS     |&#x25ef;|&#x25ef; |&#x25ef; |&#x25ef;|   --   |   --   |
| Windows10 |&#x25ef;|&#x25ef; |&#x25ef; |   --   |&#x25ef;|&#x25ef;|
| Linux     |&#x25ef;|&#x25ef; |&#x25ef; |   --   |   --   |   --   |


## License

Copyright (C) 2018 Takayuki Sato

This program is free software under [MIT][mit-url] License.
See the file LICENSE in this distribution for more details.

[repo-url]: https://github.com/sttk/fav-json/
[npm-img]: https://img.shields.io/badge/npm-v0.0.0-blue.svg
[npm-url]: https://www.npmjs.com/package/@fav/text.camel-case
[mit-img]: https://img.shields.io/badge/license-MIT-green.svg
[mit-url]: https://opensource.org/licenses/MIT
[travis-img]: https://travis-ci.org/sttk/fav-json.svg?branch=master
[travis-url]: https://travis-ci.org/sttk/fav-json
[appveyor-img]: https://ci.appveyor.com/api/projects/status/github/sttk/fav-json?branch=master&svg=true
[appveyor-url]: https://ci.appveyor.com/project/sttk/fav-json
[coverage-img]: https://coveralls.io/repos/github/sttk/fav-json/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/sttk/fav-json?branch=master
