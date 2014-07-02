var Promise = require('bluebird');

Promise.resolve()
.then(function() { throw new Error('boom'); });
