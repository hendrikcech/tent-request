var discover = require('tent-discover')
var userConfig = require('./config.json')
var writeFileSync = require('fs').writeFileSync

var config = {}
var configKey = Object.keys(userConfig)[0]

if(process.env.HOST) {
	configKey = process.env.HOST
}

if(!(config = userConfig[configKey])) {
	throw new Error('could not load config "'+ configKey +'"')
}

var configSave = JSON.parse(JSON.stringify(config))

// example:
// CUPCAKE_ACCESS_TOKEN > ACCESS_TOKEN > auth.access_token > auth.id

var auth = config.auth = config.auth || {}
config.auth = {
	id: entityEnvVar('ACCESS_TOKEN') || process.env.ACCESS_TOKEN || auth.access_token || auth.id,
	key: entityEnvVar('HAWK_KEY') || process.env.HAWK_KEY || auth.hawk_key || auth.key,
	algorithm: entityEnvVar('ALGORITHM') || process.env.ALGORITHM || auth.algorithm || "sha256",
	token_type: entityEnvVar('TOKEN_TYPE') || process.env.TOKEN_TYPE || auth.token_type || "https://tent.io/oauth/hawk-token"
}

if(!config.auth.id) {
	throw new Error('auth.access_token required')
}
if(!config.auth.key) {
	throw new Error('auth.hawk_key required')
}

if(!config.meta) {
	var entity = entityEnvVar('ENTITY') || process.env.ENTITY || config.entity
	if(!entity) {
		throw new Error('either "meta" or "entity" key required')
	}
	discover(entity, function(err, body) {
		if(err) {
			throw new Error('error fetching meta post: ' + err.message)
		}

		configSave.meta = {}
		configSave.meta.entity = body.post.content.entity
		configSave.meta.servers = body.post.content.servers
		userConfig[configKey] = configSave

		writeFileSync(__dirname + '/config.json', JSON.stringify(userConfig, null, 4))
	})
}

if(!config.type) {
	config.type = process.env.TYPE || userConfig.type || 'https://custom.type/v0#'
}

module.exports = config

function entityEnvVar(name) {
	return process.env[configKey.toUpperCase() + '_' + name]
}