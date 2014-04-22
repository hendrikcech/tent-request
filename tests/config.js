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

var auth = config.auth = config.auth || {}
config.auth = {
	id: process.env.ACCESS_TOKEN || auth.access_token || auth.id,
	key: process.env.HAWK_KEY || auth.hawk_key || auth.key,
	algorithm: process.env.ALGORITHM || auth.algorithm || "sha256",
	token_type: process.env.TOKEN_TYPE || auth.token_type || "https://tent.io/oauth/hawk-token"
}

if(!config.auth.id) {
	throw new Error('auth.access_token required')
}
if(!config.auth.key) {
	throw new Error('auth.hawk_key required')
}

if(!config.meta) {
	var entity = process.env.ENTITY || config.entity
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