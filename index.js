(function() {
  var MsgpackRPC, RockSolidSocket, SHA3, Stampery, amqp, crypto, iced, msgpack, stream, __iced_k, __iced_k_noop,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  iced = require('iced-runtime');
  __iced_k = __iced_k_noop = function() {};

  crypto = require('crypto');

  stream = require('stream');

  SHA3 = require('sha3');

  RockSolidSocket = require('rocksolidsocket');

  MsgpackRPC = require('msgpackrpc');

  amqp = require('amqplib/callback_api');

  msgpack = require('msgpack');

  Stampery = (function() {
    function Stampery(clientSecret, beta) {
      var host, sock;
      this.clientSecret = clientSecret;
      this.beta = beta;
      this._connectRabbit = __bind(this._connectRabbit, this);
      this.clientId = this._hash('md5', this.clientSecret).substring(0, 15);
      if (this.beta) {
        host = 'api-beta-0.us-east.aws.stampery.com:4000';
      } else {
        host = 'api-0.us-east.aws.stampery.com:4000';
      }
      sock = new RockSolidSocket(host);
      this.rpc = new MsgpackRPC('stampery.3', sock);
      this._auth();
      this._connectRabbit();
    }

    Stampery.prototype._connectRabbit = function() {
      var err, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "./index.iced",
            funcname: "Stampery._connectRabbit"
          });
          amqp.connect('amqp://consumer:9FBln3UxOgwgLZtYvResNXE7@young-squirrel.rmq.cloudamqp.com/ukgmnhoi', __iced_deferrals.defer({
            assign_fn: (function(__slot_1) {
              return function() {
                err = arguments[0];
                return __slot_1.rabbit = arguments[1];
              };
            })(_this),
            lineno: 24
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          if (err) {
            return console.log("[QUEUE] Error connecting " + err);
          }
          return _this.rabbit.on('error', _this._connectRabbit);
        };
      })(this));
    };

    Stampery.prototype._hash = function(algo, data) {
      return crypto.createHash(algo).update(data).digest('hex');
    };

    Stampery.prototype.hash = function(data, cb) {
      var sha3;
      if (data instanceof stream) {
        return this._hashFile(data, cb);
      } else {
        sha3 = new SHA3.SHA3Hash();
        sha3.update(data);
        return cb(sha3.digest('hex'));
      }
    };

    Stampery.prototype._sha3Hash = function(stringToHash, cb) {
      var hash;
      hash = new SHA3.SHA3Hash();
      hash.update(stringToHash);
      return cb(hash.digest('hex'));
    };

    Stampery.prototype._hashFile = function(fd, cb) {
      var hash;
      hash = new SHA3.SHA3Hash();
      fd.on('end', function() {
        return cb(hash.digest('hex'));
      });
      return fd.on('data', function(data) {
        return hash.update(data);
      });
    };

    Stampery.prototype._auth = function() {
      var err, res, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "./index.iced",
            funcname: "Stampery._auth"
          });
          _this.rpc.invoke('auth', [_this.clientId, _this.clientSecret], __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                return res = arguments[1];
              };
            })(),
            lineno: 53
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          console.log("[RPC] Auth: ", err, res);
          if (err) {
            return console.log("[RPC] Auth error: " + err);
          }
        };
      })(this));
    };

    Stampery.prototype.retrieveProofForHash = function(hash, cb) {
      var err, ok, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "./index.iced",
            funcname: "Stampery.retrieveProofForHash"
          });
          _this.rabbit.createChannel(__iced_deferrals.defer({
            assign_fn: (function(__slot_1) {
              return function() {
                err = arguments[0];
                return __slot_1.channel = arguments[1];
              };
            })(_this),
            lineno: 58
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          console.log("[QUEUE] Bound to " + hash + "-clnt", err);
          (function(__iced_k) {
            if (_this.channel) {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "./index.iced",
                  funcname: "Stampery.retrieveProofForHash"
                });
                _this.channel.assertQueue("" + hash + "-clnt", {
                  durable: true
                }, __iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      err = arguments[0];
                      return ok = arguments[1];
                    };
                  })(),
                  lineno: 60
                }));
                __iced_deferrals._fulfill();
              })(__iced_k);
            } else {
              return __iced_k();
            }
          })(function() {
            return _this.channel.consume("" + hash + "-clnt", function(msg) {
              delete this.hashCache[this.hashCache.indexOf(hash)];
              console.log("[QUEUE] Received -> %s", msg.content.toString());
              this.channel.ack(msg);
              return cb(null, msg);
            });
          });
        };
      })(this));
    };

    Stampery.prototype.calculateProof = function(hash, siblings, cb) {
      var idx, lastComputedLeave, sibling;
      lastComputedLeave = hash;
      for (idx in siblings) {
        sibling = siblings[idx];
        console.log("[SIBLINGS] Calculating sibling " + idx, lastComputedLeave, sibling);
        this._sumSiblings(lastComputedLeave, sibling, function(sum) {
          console.log("[SIBLINGS] Calculated " + sum);
          return lastComputedLeave = sum;
        });
      }
      return cb(lastComputedLeave);
    };

    Stampery.prototype._sumSiblings = function(leave1, leave2, cb) {
      var hash, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      if (parseInt(leave1, 16) > parseInt(leave2, 16)) {
        console.log("[SIBLINGS] Leave1 is bigger than Leave2");
        (function(_this) {
          return (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "./index.iced",
              funcname: "Stampery._sumSiblings"
            });
            _this._sha3Hash("" + leave1 + leave2, __iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return hash = arguments[0];
                };
              })(),
              lineno: 81
            }));
            __iced_deferrals._fulfill();
          });
        })(this)((function(_this) {
          return function() {
            return __iced_k(cb(hash));
          };
        })(this));
      } else {
        console.log("[SIBLINGS] Leave2 is bigger than Leave1");
        (function(_this) {
          return (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "./index.iced",
              funcname: "Stampery._sumSiblings"
            });
            _this._sha3Hash("" + leave2 + leave1, __iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return hash = arguments[0];
                };
              })(),
              lineno: 85
            }));
            __iced_deferrals._fulfill();
          });
        })(this)((function(_this) {
          return function() {
            return __iced_k(cb(hash));
          };
        })(this));
      }
    };

    Stampery.prototype.stamp = function(hash, cb) {
      var err, res, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      hash = hash.toUpperCase();
      if (!this.rabbit) {
        return setTimeout(this.stamp.bind(this, hash, cb), 500);
      }
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "./index.iced",
            funcname: "Stampery.stamp"
          });
          _this.rpc.invoke('stamp', [hash], __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                return res = arguments[1];
              };
            })(),
            lineno: 91
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          if (err) {
            console.log("[RPC] Error: " + err);
            return cb(err, null);
          }
          if (_this.rabbit) {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "./index.iced",
                funcname: "Stampery.stamp"
              });
              _this.rabbit.createChannel(__iced_deferrals.defer({
                assign_fn: (function(__slot_1) {
                  return function() {
                    err = arguments[0];
                    return __slot_1.channel = arguments[1];
                  };
                })(_this),
                lineno: 97
              }));
              __iced_deferrals._fulfill();
            })(function() {
              console.log("[QUEUE] Bound to " + hash + "-clnt", err);
              return __iced_k(_this.channel.consume("" + hash + "-clnt", function(queueMsg) {
                var unpackedMsg;
                _this.channel.ack(queueMsg);
                unpackedMsg = msgpack.unpack(queueMsg.content);
                console.log((unpackedMsg[3][0] === 1) || (unpackedMsg[3][0] === -1), (unpackedMsg[3][0] === 2) || (unpackedMsg[3][0] === -2));
                if ((unpackedMsg[3][0] === 1) || (unpackedMsg[3][0] === -1)) {
                  console.log('[QUEUE-BTC] Detected data: ', queueMsg.content.toString());
                  console.log("[QUEUE-BTC] Received -> %s", unpackedMsg[1]);
                  return cb(null, unpackedMsg);
                } else if ((unpackedMsg[3][0] === 2) || (unpackedMsg[3][0] === -2)) {
                  console.log("[QUEUE-ETH] Received ETH -> %s", unpackedMsg[1]);
                  console.log("[QUEUE-BTC] Bound to " + unpackedMsg[1] + "-clnt");
                  if (("" + unpackedMsg[1] + "-clnt") !== ("" + hash + "-clnt")) {
                    _this.channel.consume("" + unpackedMsg[1] + "-clnt", function(btcMsg) {
                      var unpackedBtcMsg;
                      console.log('[QUEUE-BTC] Detected data: ', btcMsg.content.toString());
                      unpackedBtcMsg = msgpack.unpack(btcMsg.content);
                      console.log("[QUEUE-BTC] Received -> %s", unpackedBtcMsg);
                      return cb(null, unpackedBtcMsg);
                    });
                  }
                  return cb(null, unpackedMsg);
                }
              }));
            });
          } else {
            return __iced_k(cb("Error binding to " + hash + "-clnt", null));
          }
        };
      })(this));
    };

    return Stampery;

  })();

  module.exports = Stampery;

}).call(this);
