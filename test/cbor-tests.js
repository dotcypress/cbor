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
      describe('# positive', function () {
        it('# 0', function (done) {
          callEncoder(done, 0, [0]);
        });

        it('# 0.0', function (done) {
          callEncoder(done, 0.0, [0]);
        });

        it('# < 24', function (done) {
          callEncoder(done, 23, [0x17]);
        });

        it('# >= 24', function (done) {
          callEncoder(done, 24, [0x18, 0x18]);
        });

        it('# 100', function (done) {
          callEncoder(done, 100, [0x18, 0x64]);
        });

        it('# 1000', function (done) {
          callEncoder(done, 1000, [0x19, 0x03, 0xe8]);
        });

        it('# 1000000', function (done) {
          callEncoder(done, 1000000, [0x1a, 0x00, 0x0f, 0x42, 0x40]);
        });

        it('# 1000000000000', function (done) {
          callEncoder(done, 1000000000000, [0x1b, 0x00, 0x00, 0x00, 0xe8, 0xd4, 0xa5, 0x10, 0x00]);
        });
      });

      describe('# negative', function () {
        it('# -1', function (done) {
          callEncoder(done, -1, [0x20]);
        });

        it('# -10', function (done) {
          callEncoder(done, -10, [0x29]);
        });

        it('# -16', function (done) {
          callEncoder(done, -16, [0x2f]);
        });

        it('# -100', function (done) {
          callEncoder(done, -100, [0x38, 0x63]);
        });

        it('# -1000', function (done) {
          callEncoder(done, -1000, [0x39, 0x03, 0xe7]);
        });
      });
    });

    describe('should process byte strings', function () {
      it('# empty', function (done) {
        callEncoder(done, new Buffer(0), [0x40]);
      });

      it('# not empty', function (done) {
        callEncoder(done, new Buffer([0x01, 0x02, 0x03, 0x04]), [0x44, 0x01, 0x02, 0x03, 0x04]);
      });
    });

    describe('should process utf strings', function () {
      it('# empty', function (done) {
        callEncoder(done, "", [0x60]);
      });

      it('# not empty', function (done) {
        callEncoder(done, "a", [0x61, 0x61]);
      });

      it('# long', function (done) {
        callEncoder(done, "IETF", [0x64, 0x49, 0x45, 0x54, 0x46]);
      });

      it('# unicode', function (done) {
        callEncoder(done, '\u00fc', [0x62, 0xc3, 0xbc]);
      });
    });

    describe('should process arrays', function () {
      it('# empty', function (done) {
        callEncoder(done, [], [0x80]);
      });

      it('# not empty', function (done) {
        callEncoder(done, [1, 2, 3], [0x83, 0x01, 0x02, 0x03]);
      });

      it('# sub arrays', function (done) {
        callEncoder(done, [1, [2, 3],
          [4, 5]
        ], [0x83, 0x01, 0x82, 0x02, 0x03, 0x82, 0x04, 0x05]);
      });
    });

    describe('should process objects', function () {
      it('# empty', function (done) {
        callEncoder(done, {}, [0xa0]);
      });

      it('# not empty', function (done) {
        callEncoder(done, {
          "a": 1,
          "b": [2, 3]
        }, [0xa2, 0x61, 0x61, 0x01, 0x61, 0x62, 0x82, 0x02, 0x03]);
      });

      it('# wrong keys order', function (done) {
        callEncoder(done, {
          "b": [2, 3],
          "a": 1
        }, [0xa2, 0x61, 0x61, 0x01, 0x61, 0x62, 0x82, 0x02, 0x03]);
      });
    });
  });

  describe('#decode()', function () {

  });
});
