var _ = require('lodash');

function encodeCbor(value, writableStream) {
  if (_.isUndefined(value)) {
    writableStream.write(new Buffer([23]));
  } else if (_.isNull(value)) {
    writableStream.write(new Buffer([22]));
  } else if (_.isBoolean(value)) {
    if (value) {
      writableStream.write(new Buffer([21]));
    } else {
      writableStream.write(new Buffer([20]));
    }
  } else if (_.isNumber(value)) {
    //TODO: check for floating point number
    if (value >= 0 || value < 24) {
      writableStream.write(new Buffer([value]));
    } else {

    }
  }
  writableStream.end();
};

function decodeCbor(input, callback) {
  callback(null, null);
};

module.exports.cbor = {
  encode: encodeCbor,
  decode: decodeCbor,
};
