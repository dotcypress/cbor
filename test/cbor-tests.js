var cbor = require("./../index");
var assert = require("assert");
var MemoryStream = require('memorystream');


Buffer.prototype.toByteArray = function () {
  return Array.prototype.slice.call(this, 0);
};

assert.arrayEqual = function (first, second) {
  assert.equal(first.length, second.length, "arrays is not equal " + first + " != " + second);
  for (var i = first.length - 1; i >= 0; i--) {
    assert.equal(first[i], second[i], "arrays is not equal " + first + " != " + second);
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
      callEncoder(done, undefined, [0xf7]);
    });

    it('should process null', function (done) {
      callEncoder(done, null, [0xf6]);
    });

    it('should process boolean (true)', function (done) {
      callEncoder(done, true, [0xf5]);
    });

    it('should process boolean (false)', function (done) {
      callEncoder(done, false, [0xf4]);
    });

    describe('should process integers', function () {
      it('== 0', function (done) {
        callEncoder(done, 0, [0]);
      });

      it('< 24', function (done) {
        callEncoder(done, 23, [0x17]);
      });

      it('>= 24', function (done) {
        callEncoder(done, 24, [0x18, 0x18]);
      });

      it('100', function (done) {
        callEncoder(done, 100, [0x18, 0x64]);
      });

      it('1000', function (done) {
        callEncoder(done, 1000, [0x19, 0x03, 0xe8]);
      });
      it('1000000', function (done) {
        callEncoder(done, 1000000, [0x1a, 0x00, 0x0f, 0x42, 0x40]);
      });
    });
  });

  describe('#decode()', function () {

  });
});
