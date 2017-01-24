(function() {
  var Stampery, crypto, request,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  crypto = require('crypto');

  request = require('request');


  /**
  * Stampery API for NodeJS: seamlessly integrate the blockchain-powered,
  * industrial-scale certification platform into your NodeJS apps.
   */

  Stampery = (function() {
    function Stampery(clientSecret, env) {
      var buf;
      this.clientSecret = clientSecret;
      this.env = env != null ? env : 'prod';
      this._merkleMix = bind(this._merkleMix, this);
      this._checkSiblings = bind(this._checkSiblings, this);
      this.prove = bind(this.prove, this);
      this._req = bind(this._req, this);
      this._post = bind(this._post, this);
      this._get = bind(this._get, this);
      this.stamp = bind(this.stamp, this);
      this.getAll = bind(this.getAll, this);
      this.getByHash = bind(this.getByHash, this);
      this.getById = bind(this.getById, this);
      this.clientId = crypto.createHash('md5').update(this.clientSecret).digest('hex').substring(0, 15);
      buf = new Buffer(this.clientId + ":" + this.clientSecret);
      this.auth = 'Basic ' + buf.toString('base64');
      this.host = this.env === 'beta' ? 'https://api-beta.stampery.com' : 'https://api-prod.stampery.com';
    }


    /**
    * Convenience function for obtaining the SHA-256 hash of a string
    * @param {(string|buffer)} input - String or Buffer to hash
    * @returns {buffer} Resulting buffer containing the hashed string
     */

    Stampery.prototype.hash = function(input) {
      return crypto.createHash('sha256').update(input).digest();
    };


    /**
     * Retrieve information and receipts for one stamp ID
     * @param {string} sid - Stamp ID
     * @param {getByIdCallback} cb - Callback for handling the response
     */

    Stampery.prototype.getById = function(sid, cb) {
      return this._get("stamps/" + sid, function(err, res) {
        if (res) {
          res = res[0];
        }
        return cb(err, res);
      });
    };


    /**
    * @callback getByIdCallback
    * @param {Object} err - Error
    * @param {Object} res - Stamp information and receipts
     */


    /**
     * Retrieve information and receipts for all stamps related to one hash
     * @param {(string|Buffer)} hash - Hash
     * @param {getByHashCallback} cb - Callback for handling the response
     */

    Stampery.prototype.getByHash = function(hash, cb) {
      if (hash instanceof Buffer) {
        hash = hash.toString('hex');
      }
      return this._get("stamps/" + hash, cb);
    };


    /**
    * @callback getByHashCallback
    * @param {Object} err - Error
    * @param {Object[]} res - Array containing stamp information and receipts
     */


    /**
     * Retrieve information and receipts for all my stamps
     * @param {number=0} page - Results are paginated and returned in chunks of 50
     * @param {getAllCallback} cb - Callback for handling the response
     */

    Stampery.prototype.getAll = function(cb, aux) {
      var page, ref;
      ref = aux != null ? [cb, aux] : [0, cb], page = ref[0], cb = ref[1];
      return this._get("stamps?page=" + page, cb);
    };


    /**
    * @callback getByHashCallback
    * @param {Object} err - Error
    * @param {Object[]} res - Array containing stamp information and receipts
     */


    /**
    * Function for submitting a new stamp
    * @param {(string|buffer)} hash - The hash to be stamped
    * @param {stampCallback} cb - Callback for handling the response
     */

    Stampery.prototype.stamp = function(hash, cb) {
      if (hash instanceof Buffer) {
        hash = hash.toString('hex');
      }
      return this._post("stamps", {
        hash: hash
      }, cb);
    };


    /**
    * @callback stampCallback
    * @param {Object} err - Error
    * @param {Object} res - Stamp information and receipts ETA
     */

    Stampery.prototype._get = function(path, cb) {
      return this._req('GET', path, {}, cb);
    };

    Stampery.prototype._post = function(path, params, cb) {
      return this._req('POST', path, params, cb);
    };

    Stampery.prototype._req = function(method, path, params, cb) {
      var options;
      options = {
        method: method,
        url: this.host + "/" + path,
        headers: {
          'Authorization': this.auth,
          'Content-Type': 'application/json'
        }
      };
      if (params) {
        options.json = params;
      }
      return request(options, function(error, response, body) {
        if (error) {
          return cb(error, null);
        } else if (response.statusCode >= 400) {
          return cb({
            code: response.statusCode,
            message: response.statusMessage
          }, null);
        } else {
          return cb(null, body.result);
        }
      });
    };


    /**
    * Function for proving a the receipts contained in a stamp
    * @param {Object} receipts - The 'receipts' object or the stamp itself
    * @param {proveCallback} cb - Callback for handling the result
     */

    Stampery.prototype.prove = function(receipt) {
      var hash;
      if ('receipts' in receipt) {
        receipt = receipt.receipts;
      }
      if ('btc' in receipt) {
        receipt = [receipt.btc, receipt.eth].find(function(receipt) {
          return typeof receipt !== 'number';
        });
      }
      if (receipt) {
        hash = Buffer(receipt.targetHash, 'hex');
        return this._checkSiblings(hash, receipt.proof, receipt.merkleRoot);
      }
      return false;
    };


    /**
    * @callback proveCallback
    * @param {Boolean} res - Whether the longest receipt is valid or not
     */

    Stampery.prototype._checkSiblings = function(hash, siblings, root) {
      var hashes, head, mix, tail;
      if (siblings.length > 0) {
        head = siblings[0];
        tail = siblings.slice(1);
        hashes = 'left' in head ? [head.left, hash] : [hash, head.right];
        mix = this._merkleMix(hashes);
        return this._checkSiblings(mix, tail, root);
      } else {
        root = new Buffer(root, 'hex');
        return root.equals(hash);
      }
    };

    Stampery.prototype._merkleMix = function(hashes) {
      var buf;
      buf = Buffer.concat(hashes.map(function(h) {
        return Buffer(h, 'hex');
      }));
      return this.hash(buf);
    };

    return Stampery;

  })();

  module.exports = Stampery;

}).call(this);
