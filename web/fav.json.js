(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.fav || (g.fav = {})).json = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var isFunction = require('@fav/type.is-function');
var reviver = require('./lib/reviver');
var replacer = require('./lib/replacer');

function Json() {
  Object.defineProperties(this, {
    supportedTypes: { value: {} },
    replacer: { value: replacer.bind(this) },
    reviver: { value: reviver.bind(this) },
  });

  this.supports(Date, dateReplacer, dateReviver);
}

function dateReplacer(date) {
  return date.getTime();
}

function dateReviver(n) {
  return new Date(n);
}


Json.prototype.supports = function(constructor, replacer, reviver) {
  if (!isFunction(constructor)) {
    return;
  }

  replacer = replacer || toJsonOf(constructor) || JSON.stringify;
  reviver = reviver || creatorOf(constructor);

  /* istanbul ignore if */
  if (!constructor.name) { // undefined on IE11
    constructor.name = getFunctionName(constructor);
  }

  if (isFunction(replacer) && isFunction(reviver) && constructor.name) {
    this.supportedTypes[constructor.name] = {
      replace: replacer,
      revive: reviver,
    };
  }

  return this;
};

function toJsonOf(constructor) {
  if (constructor.prototype.toJSON) {
    return function(a) {
      return a.toJSON();
    };
  }
}

function creatorOf(constructor) {
  return function(a) {
    return new constructor(a);
  };
}

/* istanbul ignore next */
function getFunctionName(constructor) {
  var result = /^function ([^(]+)\(/.exec(constructor.toString());
  if (result) {
    return result[1];
  }
}

Json.prototype.stringify = function(anyData) {
  var obj = replacer.convert(anyData, this.supportedTypes);
  return JSON.stringify(obj, this.replacer);
};

Json.prototype.parse = function(jsonText) {
  return JSON.parse(jsonText, this.reviver);
};

module.exports = Json;

},{"./lib/replacer":2,"./lib/reviver":3,"@fav/type.is-function":4}],2:[function(require,module,exports){
'use stirct';

function replacer(key, value) {
  switch (Object.prototype.toString.call(value)) {
    case '[object Array]': {
      return convertArray(value, this.supportedTypes);
    }
    case '[object String]':
    case '[object Number]':
    case '[object Boolean]':
    case '[object Null]':
    case '[object Undefined]':
    case '[object Symbol]':
    case '[object Function]': {
      return value;
    }
    default: {
      return convertObject(value, this.supportedTypes);
    }
  }
}

function convertArray(arr, supportedTypes) {
  for (var i = 0, n = arr.length; i < n; i++) {
    if (needToConvert(arr[i], supportedTypes)) {
      var newArr = new Array(arr.length);
      for (var j = 0; j < n; j++) {
        newArr[j] = convert(arr[j], supportedTypes);
      }
      return newArr;
    }
  }
  return arr;
}

function convertObject(obj, supportedTypes) {
  var keys = Object.keys(obj);
  for (var i = 0, n = keys.length; i < n; i++) {
    if (needToConvert(obj[keys[i]], supportedTypes)) {
      var newObj = {};
      for (var j = 0 ; j < n; j++) {
        var key = keys[j];
        newObj[key] = convert(obj[key], supportedTypes);
      }
      return newObj;
    }
  }
  return obj;
}

function needToConvert(value, supportedTypes) {
  switch (Object.prototype.toString.call(value)) {
    case '[object String]': {
      return (value[0] === '|');
    }
    case '[object Number]':
    case '[object Boolean]':
    case '[object Array]':
    case '[object Null]':
    case '[object Undefined]':
    case '[object Symbol]':
    case '[object Function]': {
      return false;
    }
    default: {
      var type = (value.constructor || {}).name;
      if (type !== 'Object') {
        return Boolean(supportedTypes[type]);
      }
    }
  }
}

function convert(value, supportedTypes) {
  switch (Object.prototype.toString.call(value)) {
    case '[object String]': {
      if (value[0] === '|') {
        return '|' + value;
      }
      return value;
    }
    case '[object Number]':
    case '[object Boolean]':
    case '[object Array]':
    case '[object Null]':
    case '[object Undefined]':
    case '[object Symbol]':
    case '[object Function]': {
      return value;
    }
    default: {
      var type = (value.constructor || {}).name;
      if (type !== 'Object') {
        var conv = supportedTypes[type];
        if (conv) {
          return '|' + type + '|' + conv.replace(value);
        }
      }
      return value;
    }
  }
}

replacer.convert = convert;

module.exports = replacer;

},{}],3:[function(require,module,exports){
'use strict';

function reviver(key, value) {
  if (typeof value !== 'string') {
    return value;
  }

  var result = /^\|([^\|]+)\|(.*)$/.exec(value); // '|type|xxxx'
  if (!result) {
    if (/^\|\|/.test(value)) {  // '||xxx' => '|xxx'
      return value.slice(1);
    } else {
      return value;
    }
  }

  var type = result[1];
  var body = result[2];

  switch (type) {
    case 'String':
    case 'Array':
    case 'Object':
    case 'Number':
    case 'Boolean':
    case 'Null':
    case 'Undefined':
    case 'Symbol':
    case 'Function': {
      return value;
    }
    default: {
      var conv = this.supportedTypes[type];
      if (conv) {
        return conv.revive(JSON.parse(body));
      }
      return value;
    }
  }
}

module.exports = reviver;

},{}],4:[function(require,module,exports){
'use strict';

function isFunction(value) {
  return (typeof value === 'function');
}

function isNotFunction(value) {
  return (typeof value !== 'function');
}

Object.defineProperty(isFunction, 'not', {
  enumerable: true,
  value: isNotFunction,
});

module.exports = isFunction;

},{}]},{},[1])(1)
});
