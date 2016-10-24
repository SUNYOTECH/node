Stampery = require('./index.js');

console.log("test")
stampery = new Stampery('2d4cdee7-38b0-4a66-da87-c1ab05b43768');
stampery.hash('foo', function(hash) {
    console.log(hash)
  });

stampery.on('proof', function(hash, proof) {
  console.log("Received proof for " + hash, proof);
  stampery.prove(hash, proof, function (valid) {
    console.log('Proof validity:', valid);
  });
});

stampery.on('error', function(err) {
  console.log('woot: ', err);
});

stampery.on('ready', function() {
  stampery.receiveMissedProofs();
  var random = Math.random().toString(36).slice(2)
  stampery.hash('foo', function(hash) {
    console.log(hash)
  });
});
