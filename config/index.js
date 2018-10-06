const merge = require('lodash.merge');

let defaultConfig = {};
let currentEnvConfig = {};

try {
	defaultConfig = require('./default.json');
} catch (e) {
	console.log('config/default.json not found or invalid');
}

try {
	currentEnvConfig = require(`./${process.env.NODE_ENV}.json`);
} catch (e) {}

module.exports = merge(defaultConfig, currentEnvConfig);
