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

  var callEncoder = function (value, expected, semanticTag, done) {
    var isSemantic = done;
    if (!done) {
      done = semanticTag;
    }
    var encoder = {
      buffer: new Array(),
      input: new MemoryStream()
    };
    encoder.input.on('data', function (chunk) {
      encoder.buffer = encoder.buffer.concat(chunk.toByteArray());
    });
    encoder.input.on('end', function () {
      assert.arrayEqual(encoder.buffer, expected);
      done();
    });
    encoder.input.on('error', function (err) {
      throw err;
    });
    if (isSemantic) {
      cbor.encodeSemantic(semanticTag, value, encoder.input);
    } else {
      cbor.encode(value, encoder.input);
    }
    encoder.input.end();
  };

  describe('#encode()', function () {

    it('should process undefined', function (done) {
      callEncoder(undefined, [0xf7], done);
    });

    it('should process null', function (done) {
      callEncoder(null, [0xf6], done);
    });

    it('should process boolean (true)', function (done) {
      callEncoder(true, [0xf5], done);
    });

    it('should process boolean (false)', function (done) {
      callEncoder(false, [0xf4], done);
    });

    describe('should process integers', function () {
      describe('# positive', function () {
        it('# 0', function (done) {
          callEncoder(0, [0], done);
        });

        it('# 0.0', function (done) {
          callEncoder(0.0, [0], done);
        });

        it('# < 24', function (done) {
          callEncoder(23, [0x17], done);
        });

        it('# >= 24', function (done) {
          callEncoder(24, [0x18, 0x18], done);
        });

        it('# 100', function (done) {
          callEncoder(100, [0x18, 0x64], done);
        });

        it('# 1000', function (done) {
          callEncoder(1000, [0x19, 0x03, 0xe8], done);
        });

        it('# 1000000', function (done) {
          callEncoder(1000000, [0x1a, 0x00, 0x0f, 0x42, 0x40], done);
        });

        it('# 1000000000000', function (done) {
          callEncoder(1000000000000, [0x1b, 0x00, 0x00, 0x00, 0xe8, 0xd4, 0xa5, 0x10, 0x00], done);
        });
      });

      describe('# negative', function () {
        it('# -1', function (done) {
          callEncoder(-1, [0x20], done);
        });

        it('# -10', function (done) {
          callEncoder(-10, [0x29], done);
        });

        it('# -16', function (done) {
          callEncoder(-16, [0x2f], done);
        });

        it('# -100', function (done) {
          callEncoder(-100, [0x38, 0x63], done);
        });

        it('# -1000', function (done) {
          callEncoder(-1000, [0x39, 0x03, 0xe7], done);
        });
      });
    });

    describe('should process byte strings', function () {
      it('# empty', function (done) {
        callEncoder(new Buffer(0), [0x40], done);
      });

      it('# not empty', function (done) {
        callEncoder(new Buffer([0x01, 0x02, 0x03, 0x04]), [0x44, 0x01, 0x02, 0x03, 0x04], done);
      });
    });

    describe('should process utf strings', function () {
      it('# empty', function (done) {
        callEncoder("", [0x60], done);
      });

      it('# not empty', function (done) {
        callEncoder("a", [0x61, 0x61], done);
      });

      it('# long', function (done) {
        callEncoder("IETF", [0x64, 0x49, 0x45, 0x54, 0x46], done);
      });

      it('# unicode', function (done) {
        callEncoder('\u00fc', [0x62, 0xc3, 0xbc], done);
      });
    });

    describe('should process arrays', function () {
      it('# empty', function (done) {
        callEncoder([], [0x80], done);
      });

      it('# not empty', function (done) {
        callEncoder([1, 2, 3], [0x83, 0x01, 0x02, 0x03], done);
      });

      it('# sub arrays', function (done) {
        callEncoder([1, [2, 3],
          [4, 5]
        ], [0x83, 0x01, 0x82, 0x02, 0x03, 0x82, 0x04, 0x05], done);
      });
    });

    describe('should process objects', function () {
      it('# empty', function (done) {
        callEncoder({}, [0xa0], done);
      });

      it('# not empty', function (done) {
        callEncoder({
          "a": 1,
          "b": [2, 3]
        }, [0xa2, 0x61, 0x61, 0x01, 0x61, 0x62, 0x82, 0x02, 0x03], done);
      });

      it('# wrong keys order', function (done) {
        callEncoder({
          "b": [2, 3],
          "a": 1
        }, [0xa2, 0x61, 0x61, 0x01, 0x61, 0x62, 0x82, 0x02, 0x03], done);
      });
    });

    describe('should process floats', function () {
      it('# not empty', function (done) {
        callEncoder(1.1, [0xfb, 0x3f, 0xf1, 0x99, 0x99, 0x99, 0x99, 0x99, 0x9a], done);
      });

      it('# negative', function (done) {
        callEncoder(-4.1, [0xfb, 0xc0, 0x10, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66], done);
      });
    });

    describe('should process semantic values', function () {
      it('# date', function (done) {
        callEncoder("2013-03-21T20:04:00Z", [0xc0, 0x74, 0x32, 0x30, 0x31, 0x33, 0x2d, 0x30, 0x33, 0x2d, 0x32, 0x31, 0x54, 0x32, 0x30, 0x3a, 0x30, 0x34, 0x3a, 0x30, 0x30, 0x5a], 0, done);
      });

    });
  });
});
