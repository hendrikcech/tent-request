var config

try {
	config = require('./config.json')
} catch(e) {
	throw new Error('config file not found')
	process.exit(1)
}

var c = config

if(!c.meta || !c.meta.entity || !c.meta.servers
	|| !c.meta.servers[0].urls
	|| !(c.auth.access_token || c.auth.id)
	|| !(c.auth.hawk_key || c.auth.key)
	|| !(c.auth.hawk_algorithm || c.auth.token_type)) {
		console.log('somethings missing from the config file')
		process.exit(1)
}