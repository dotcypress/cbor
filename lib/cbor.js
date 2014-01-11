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
      writePositiveInteger(value, writableStream);
    } else {
      writeNegativeInteger(value, writableStream);
    }
  } else {

  }
};

function writePositiveInteger(value, writableStream) {
  if (value >= 0 && value < 24) {
    writableStream.write(new Buffer([value]));
  } else {
    var buffer = new Buffer(0);
    if (value <= 0xff) {
      buffer = new Buffer(2);
      buffer.writeUInt8(24, 0);
      buffer.writeUInt8(value, 1);
    } else if (value <= 0xffff) {
      buffer = new Buffer(3);
      buffer.writeUInt8(25, 0);
      buffer.writeUInt16BE(value, 1);
    } else if (value <= 0xffffffff) {
      buffer = new Buffer(5);
      buffer.writeUInt8(26, 0);
      buffer.writeUInt32BE(value, 1);
    }
    writableStream.write(buffer);
  }
};

function writeNegativeInteger(value, writableStream) {

};


function decodeCbor(input, callback) {
  callback(null, null);
};

module.exports.cbor = {
  encode: encodeCbor,
  decode: decodeCbor,
};
