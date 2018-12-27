const assert = require('assert');
const DBName = require('../index');



describe('Basic Mocha String Test', function () {
it('Check if the DB name is Authentication ', function () {
console.log("DB name is", DBName)
assert.equal("Authentication", DBName);
});
});
