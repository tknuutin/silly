
const args = require('./args');
const paths = require('./paths');
const R = require('ramda');

function stringify(val) {
    return JSON.stringify(val);
}

module.exports = {
    getBuildParams: function() {
        // String globals must be extra-stringified otherwise they will be read as code
        const params = {
            test: args.test,
        };

        return R.mapObjIndexed(stringify, params);
    }
}
