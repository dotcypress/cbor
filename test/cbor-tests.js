var cbor = require("./../index");
var assert = require("assert");
var MemoryStream = require('memorystream');


Buffer.prototype.toByteArray = function () {
  return Array.prototype.slice.call(this, 0);
};

assert.arrayEqual = function (first, second) {
  assert.equal(first.length, second.length, "arrays is not equal");
  for (var i = first.length - 1; i >= 0; i--) {
    assert.equal(first[i], second[i], "arrays is not equal");
  };
};

describe('CBOR', function () {

  var callEncoder = function (done, value, expected) {
    var stream = new MemoryStream();
    var encoder = {
      buffer: new Array(),
      input: stream
    };
    stream.on('data', function (chunk) {
      encoder.buffer = encoder.buffer.concat(chunk.toByteArray());
    });
    stream.on('end', function () {
      assert.arrayEqual(encoder.buffer, expected);
      done();
    });
    stream.on('error', function (err) {
      throw err;
    });
    cbor.encode(value, encoder.input);
  };

  describe('#encode()', function () {

    it('should process undefined', function (done) {
      callEncoder(done, undefined, [23]);
    });

    it('should process null', function (done) {
      callEncoder(done, null, [22]);
    });

    it('should process boolean (true)', function (done) {
      callEncoder(done, true, [21]);
    });

    it('should process boolean (false)', function (done) {
      callEncoder(done, false, [20]);
    });

    it('should process 0', function (done) {
      callEncoder(done, 0, [0]);
    });

    it('should process integers < 24', function (done) {
      callEncoder(done, 23, [23]);
    });

  });

  describe('#decode()', function () {

    it('should work', function (done) {
      cbor.decode(null, function (err) {
        if (err) {
          throw err;
        }
        done();
      });
    });

  });
});
