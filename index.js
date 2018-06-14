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
  if (isFunction(constructor)) {
    replacer = replacer || toJsonOf(constructor) || JSON.stringify;
    reviver = reviver || creatorOf(constructor);
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

Json.prototype.stringify = function(anyData) {
  var obj = replacer.convert(anyData, this.supportedTypes);
  return JSON.stringify(obj, this.replacer);
};

Json.prototype.parse = function(jsonText) {
  return JSON.parse(jsonText, this.reviver);
};

module.exports = Json;
