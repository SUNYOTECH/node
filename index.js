// Generated by IcedCoffeeScript 108.0.9
(function() {
  var Stampery, crypto, iced, request, stream, __iced_k, __iced_k_noop;

  iced = require('iced-runtime');
  __iced_k = __iced_k_noop = function() {};

  crypto = require('crypto');

  request = require('request');

  stream = require('stream');

  Stampery = (function() {
    function Stampery(apiSecret, beta) {
      var auth, md5;
      this.apiSecret = apiSecret;
      this.beta = beta;
      md5 = crypto.createHash('md5');
      md5.update(this.apiSecret);
      md5 = md5.digest('hex');
      this.clientId = md5.substring(0, 15);
      auth = new Buffer("" + this.clientId + ":" + this.apiSecret).toString('base64');
      this.req = request.defaults({
        baseUrl: !this.beta ? 'https://stampery.herokuapp.com/api/v2' : 'https://stampery-beta.herokuapp.com/api/v2',
        json: true,
        headers: {
          'Authorization': auth
        }
      });
    }

    Stampery.prototype.hash = function(data) {
      var hash;
      hash = crypto.createHash('sha256');
      hash.update(data);
      return hash.digest('hex');
    };

    Stampery.prototype.stamp = function(data, file, cb) {
      if ((file != null) && (cb != null)) {
        return this._stampFile(data, file, cb);
      } else {
        return this._stampJSON(data, file);
      }
    };

    Stampery.prototype._stampJSON = function(data, cb) {
      var body, err, res, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/user/dev/node/index.iced",
            funcname: "Stampery._stampJSON"
          });
          _this.req.post({
            uri: '/stamps',
            json: data
          }, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                res = arguments[1];
                return body = arguments[2];
              };
            })(),
            lineno: 33
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          var _ref;
          return cb(err, (_ref = res.body) != null ? _ref.hash : void 0);
        };
      })(this));
    };

    Stampery.prototype._stampFile = function(data, file, cb) {
      var body, err, formData, res, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      if (data == null) {
        data = {};
      }
      formData = {
        data: data
      };
      if (file instanceof stream) {
        (file.path != null) && (formData.data.name = file.path.split('/').slice(-1)[0]);
      }
      formData.file = {
        value: file,
        options: {
          filename: formData.data.name
        }
      };
      formData.data = JSON.stringify(formData.data);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/user/dev/node/index.iced",
            funcname: "Stampery._stampFile"
          });
          _this.req.post({
            uri: '/stamps',
            formData: formData
          }, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                res = arguments[1];
                return body = arguments[2];
              };
            })(),
            lineno: 51
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          var _ref;
          return cb(err, (_ref = res.body) != null ? _ref.hash : void 0);
        };
      })(this));
    };

    Stampery.prototype.get = function(hash, cb) {
      var err, res, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/user/dev/node/index.iced",
            funcname: "Stampery.get"
          });
          _this.req.get("/stamps/" + hash, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                err = arguments[0];
                return res = arguments[1];
              };
            })(),
            lineno: 55
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          return cb(err, res.body);
        };
      })(this));
    };

    return Stampery;

  })();

  module.exports = Stampery;

}).call(this);
