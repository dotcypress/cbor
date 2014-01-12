# cbor [![Build Status](https://secure.travis-ci.org/dotCypress/cbor.png?branch=master)](https://travis-ci.org/dotCypress/cbor)

NPM package for encoding and decoding CBOR (Concise Binary Object Representation) data. This
package implements CBOR as described in [RFC 7049](http://tools.ietf.org/html/rfc7049).

__Not ready for production__

## Installation
If you have npm installed, you can simply type:
```
  npm install cbor
```

Or you can clone this repository using the git command:
```
  git clone git://github.com/dotCypress/cbor.git
```

## Usage
Some examples how to use cbor module.

### Encode

```js
cbor.encode(value, writableStream, callback);
```
Arguments:
* ```value``` - value for encode
* ```writableStream``` - [instance of writable stream](http://nodejs.org/api/stream.html#stream_class_stream_writable)
* ```callback``` - callback function

#### Semantic encode

```js
cbor.encodeSemantic(tag, value, writableStream, callback);
```

Arguments:
* ```tag``` - semantic tag (integer)
* ```value``` - value for encode
* ```writableStream``` - [instance of writable stream](http://nodejs.org/api/stream.html#stream_class_stream_writable)
* ```callback``` - callback function

#### Samples

```js
  var cbor = require("cbor");
  
  var writableStream = ...; 
  var cb = ...;             

  // simple encoding
  cbor.encode(1, writableStream, cb);                     // integers
  cbor.encode(-50, writableStream, cb);                   // integers
  cbor.encode(1.1, writableStream, cb);                   // floats
  cbor.encode([123, 567, 'hello'], writableStream, cb);   // arrays
  cbor.encode({'a': 1, 'b': 2}, writableStream, cb);      // hashes
  cbor.encode(new Buffer([1,2,3,4]), writableStream, cb); // binary data
  
  // semantic encode
  cbor.encodeSemantic(0, "2013-03-21T20:04:00Z", writableStream, cb);
```

## Known issues

* All floats will be serialized only as IEEE 754 Double-Precision Float (64 bits follow)
* Encode does't support indefinite-length values.

## License
MIT
