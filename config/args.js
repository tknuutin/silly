

var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser();

parser.addArgument(['-b', '--buildtype'], {
    required: false,
    defaultValue: 'dev'
});

const args = parser.parseArgs();

module.exports = args;