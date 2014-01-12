var Int64 = require('node-int64');
var _ = require('lodash');

function isInteger(value) {
  return parseFloat(value) == parseInt(value, 10) && !isNaN(value);
};

function encodeCbor(value, writableStream) {
  writeValue(value, writableStream);
  writableStream.end();
};

var simpleValues = {
  'undefined': 0xf7,
  'null': 0xf6,
  'true': 0xf5,
  'false': 0xf4,
};

function writeValue(value, writableStream) {
  if (_.isUndefined(value)) {
    writableStream.write(new Buffer([simpleValues['undefined']]));
  } else if (_.isNull(value)) {
    writableStream.write(new Buffer([simpleValues['null']]));
  } else if (_.isBoolean(value)) {
    writeBoolean(value, writableStream);
  } else if (_.isNumber(value)) {
    writeNumber(value, writableStream);
  } else if (_.isString(value)) {
    writeString(value, writableStream);
  } else if (Buffer.isBuffer(value)) {
    writeByteString(value, writableStream);
  } else if (_.isArray(value)) {
    writeArray(value, writableStream);
  } else {
    writeObject(value, writableStream);
  }
};

function writeBoolean(value, writableStream) {
  if (value) {
    writableStream.write(new Buffer([simpleValues['true']]));
  } else {
    writableStream.write(new Buffer([simpleValues['false']]));
  }
};

function writeNumber(value, writableStream) {
  if (isInteger(value)) {
    if (value >= 0) {
      writeInteger(value, 0, writableStream);
    } else {
      writeInteger(Math.abs(value) - 1, 1 << 5, writableStream);
    }
  } else {

  }
};

function writeInteger(value, majorType, writableStream) {
  if (value >= 0 && value < 24) {
    writableStream.write(new Buffer([value | majorType]));
  } else {
    var buffer = new Buffer(0);
    if (value <= 0xff) {
      buffer = new Buffer(2);
      buffer.writeUInt8(24 | majorType, 0);
      buffer.writeUInt8(value, 1);
    } else if (value <= 0xffff) {
      buffer = new Buffer(3);
      buffer.writeUInt8(25 | majorType, 0);
      buffer.writeUInt16BE(value, 1);
    } else if (value <= 0xffffffff) {
      buffer = new Buffer(5);
      buffer.writeUInt8(26 | majorType, 0);
      buffer.writeUInt32BE(value, 1);
    } else {
      var int64 = new Int64(value);
      buffer = new Buffer(9);
      buffer.writeUInt8(27 | majorType, 0);
      int64.buffer.copy(buffer, 1);
    }
    writableStream.write(buffer);
  }
};

function writeByteString(buffer, writableStream) {
  writeInteger(buffer.length, 2 << 5, writableStream);
  writableStream.write(buffer);
};

function writeString(value, writableStream) {
  var buffer = new Buffer(value);
  writeInteger(buffer.length, 3 << 5, writableStream);
  writableStream.write(buffer);
};

function writeArray(value, writableStream) {
  writeInteger(value.length, 4 << 5, writableStream);
  _.forEach(value, function (item) {
    writeValue(item, writableStream);
  })
};

function writeObject(value, writableStream) {
  var keys = _.filter(_.keys(value), function (key) {
    return !_.isFunction(value[key]);
  });
  writeInteger(keys.length, 5 << 5, writableStream);
  _.forEach(keys, function (key) {
    writeValue(key, writableStream);
    writeValue(value[key], writableStream);
  })
};

function decodeCbor(input, callback) {
  callback(null, null);
};

module.exports.cbor = {
  encode: encodeCbor,
  decode: decodeCbor,
};
