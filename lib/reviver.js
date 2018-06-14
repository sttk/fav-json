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
