var Create = require('./lib/create')
var Delete = require('./lib/delete')
var Get = require('./lib/get')
var Query = require('./lib/query')
var Update = require('./lib/update')

function Client(meta, auth) {
	this.meta = meta
	this.auth = auth

	this.query = this.query()
	this.get = this.get()
}

Client.prototype = {
	create: function() {
		var args = Create.checkArgs.apply(null, arguments)
		args.unshift(this.meta.servers[0].urls.new_post, this.auth)
		return Create.apply(null, args)
	},
	update: function() {
		var args = Update.checkArgs.apply(null, arguments)
		var url = this.meta.servers[0].urls.post
		args.unshift(url, this.auth, this.meta.entity)
		return Update.apply(null, args)
	},
	delete: function() {
		var args = Delete.checkArgs.apply(null, arguments)
		var url = this.meta.servers[0].urls.post
		args.unshift(url, this.auth, this.meta.entity)
		return Delete.apply(null, args)
	},
	query: function() {
		var client = this

		var query = getQuery([])
		query.count = getQuery(['count'])

		function getQuery(mode) {
			return function() {
				var args = Query.checkArgs.apply(null, arguments)
				var url = client.meta.servers[0].urls.posts_feed
				args.unshift(url, client.auth, client.meta.entity, mode)
				return Query.apply(null, args)
			}
		}

		return query
	},
	get: function() {
		var client = this

		var get = getGet([])
		get.versions = getGet(['versions'])
		get.versions.count = getGet(['versions', 'count'])
		get.childVersions = getGet(['childVersions'])
		get.childVersions.count = getGet(['childVersions', 'count'])

		function getGet(mode) {
			return function() {
				var args = Get.checkArgs.apply(null, arguments)
				
				//args[1] = entity
				if(args[1] === null) args[1] = client.meta.entity

				var url = client.meta.servers[0].urls.post
				args.unshift(url, client.auth, mode)
				
				return Get.apply(null, args)
			}
		}

		return get
	},
}

module.exports = function createClient(meta, auth) {
	if(!meta) throw new Error('meta post required')
	// Allow users to provide the meta post as returned by tent-auth,
	// or the meta post content
	if(meta.post) meta = meta.post;
	if(meta.content) meta = meta.content;
	// Check at least for servers and entity
	if(!meta.servers || !meta.entity)
		throw new Error('meta post needs at least a list of servers and an entity')

	if(meta.servers.length > 1) {
		// select server with lowest preference number
		meta.servers = meta.servers.sort(function(a,b) {
			if (a.preference < b.preference) return -1
			else if (a.preference == b.preference) return 0
			else return 1
		})
	}

	if(!auth) return new Client(meta, auth)

	var authError = 'auth needs to be an object with at least access_token and hawk_key'

	if(typeof auth !== 'object' || Array.isArray(auth))
		throw new Error(authError)

	auth = {
		id: auth.id || auth.access_token,
		key: auth.key || auth.hawk_key,
		algorithm: auth.algorithm || auth.hawk_algorithm
	}

	if(!auth.id || !auth.key)
		throw new Error(authError)

	return new Client(meta, auth)
}