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
