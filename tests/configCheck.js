var c = require('./config')

if(!c.meta || !c.meta.entity || !c.meta.servers
	|| !c.meta.servers[0].urls
	|| !(c.auth.access_token || c.auth.id)
	|| !(c.auth.hawk_key || c.auth.key)
	|| !(c.auth.hawk_algorithm || c.auth.token_type)
	|| !c.type) {

	throw new Error('somethings missing from the config file')
}