var create = require('./lib/create')
var del = require('./lib/delete')
var update = require('./lib/update')
var Batch = require('./lib/batch')
var request = require('./lib/request')
var utils = require('./lib/utils')

function Client(meta, auth) {
	this.meta = meta
	this.auth = auth

	this.query = utils.constructQuery.call(this, handleConstructCB.bind(this))
	this.get = utils.constructGet.call(this, handleConstructCB.bind(this))
}

function handleConstructCB(reqOpts, cb) {
	reqOpts.auth = this.auth
	return request(reqOpts, cb)
}

Client.prototype = {

	/**
	 * Creates a new post.
	 * @param  {string}   type - Post type.
	 * @param  {object}   metadata - Metadata of post: publishedAt, mentions, licenses, permissions.
	 * @param  {object}   content - Content part of post.
	 * @param  {Function} cb - Callback to be invoked with error, response object and body.
	 * @return {[type]}
	 */
	create: function(type, metadata, content, cb) {
		var reqOpts = create(this.meta, type, metadata, content)
		reqOpts.auth = this.auth
		return request(reqOpts, arguments[arguments.length - 1])
	},

	/**
	 * Update an existing post.
	 * @param  {string}   id
	 * @param  {[type]}   parent
	 * @param  {[type]}   type
	 * @param  {[type]}   metadata
	 * @param  {[type]}   content
	 * @param  {Function} cb
	 * @return {[type]}
	 */
	update: function(id, parent, type, metadata, content, cb) {
		var reqOpts = update(this.meta, id, parent, type, metadata, content)
		reqOpts.auth = this.auth
		return request(reqOpts, arguments[arguments.length - 1])
	},

	/**
	 * Delete an existing post.
	 * @param  {string}   id
	 * @param  {object}   opts
	 * @param  {Function} cb
	 * @return {[type]}
	 */
	delete: function(id, opts, cb) {
		var reqOpts = del(this.meta, id, opts)
		reqOpts.auth = this.auth
		return request(reqOpts, arguments[arguments.length - 1])
	},

	/**
	 * Perform multiple requests with one physical.
	 * @return {batch}
	 */
	batch: function() {
		return new Batch(this.meta, this.auth)
	}
}

module.exports = function createClient(meta, auth) {
	if(!meta) throw new Error('meta post required')
	// Allow users to provide the meta post as returned by tent-auth,
	// or the meta post content
	if(meta.post) meta = meta.post
	if(meta.content) meta = meta.content
	// Check at least for servers and entity
	if(!meta.servers || !meta.entity)
		throw new Error('meta post needs at least a list of servers and an entity')

	// select server with lowest preference number
	meta.servers.sort(function(a,b) {
		if(a.preference < b.preference) return -1
		if(a.preference > b.preference) return 1
		return 0
	})

	if(!auth) {
		return new Client(meta, auth)
	}

	var authError = 'auth needs to be an object with at least access_token and hawk_key'

	if(typeof auth !== 'object' || Array.isArray(auth)) {
		throw new Error(authError)
	}

	auth = {
		id: auth.id || auth.access_token,
		key: auth.key || auth.hawk_key,
		algorithm: auth.algorithm || auth.hawk_algorithm
	}

	if(!auth.id || !auth.key) {
		throw new Error(authError)
	}

	return new Client(meta, auth)
}