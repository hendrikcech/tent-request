var hyperquest = require('hyperquest')
var url = require('url')
var concat = require('concat-stream')
var hawk = require('hawk')
var qs = require('querystring')
var urlParser = require('uri-template')
var through = require('through')

exports.createClient = function(meta, auth) {
	if(!meta) throw new Error('meta post required')
	return new Client(meta, auth)
}

var Client = function(meta, auth) {
	if(!meta) throw new Error('meta post required')
	this.meta = meta
	if(!auth) this.auth = false
	else this.auth = {
		id: auth.id || auth.access_token,
		key: auth.key || auth.hawk_key,
		algorithm: auth.algorithm || auth.hawk_algorithm
	}
}
Client.prototype.create = function(type, callback) {
	//if(!this.auth) 
	return new Create(this.meta.servers[0].urls, this.auth, type, callback)
}
Client.prototype.query = function(callback) {
	return new Query(this.meta.servers[0].urls, this.auth, callback)
}
Client.prototype.get = function(entity, id, callback) {
	return new Get(this.meta.servers[0].urls, this.auth,
		this.meta.entity, entity, id, callback)
}
Client.prototype.update = function(id, parent, callback) {
	return new Update(this.meta.servers[0].urls, this.auth,
		this.meta.entity, id, parent, callback)
}
Client.prototype.delete = function(id, callback) {
	return new Destroy(this.meta.servers[0].urls, this.auth, this.meta.entity, id, callback)
}


function Create(urls, auth, type, callback) {
	this.urls = urls
	this.auth = auth

	this.post = {}

	if(typeof type === 'function') this.callback = type
	else if(type) {
		this.post.type = type
		this.callback = callback || false
	}

	this.stream = through()
	setupStream(this.stream, this)
	
	return this.stream
}

Create.prototype.publishedAt = function(time) {
	if(this._sent) throw new Error('request already sent')
	this.post.published_at = time
	return this.stream
}
Create.prototype.mentions = function(arg) {
	if(this._sent) throw new Error('request already sent')
	this.post.mentions = this.post.mentions || []

	if(!Array.isArray(arg)) arg = [arg]

	var that = this
	arg.forEach(function(mention) {
		that.post.mentions.push(mention)
	})

	return this.stream
}
Create.prototype.licenses = function(arg) {
	if(this._sent) throw new Error('request already sent')
	this.post.licenses = this.post.licenses || []

	if(!Array.isArray(arg)) arg = [arg]

	var that = this
	arg.forEach(function(licenseURL) {
		that.post.licenses.push({ url: licenseURL })
	})

	return this.stream
}
Create.prototype.type = function(type) {
	if(this._sent) throw new Error('request already sent')
	this.post.type = type
	return this.stream
}
Create.prototype.content = function(content) {
	if(this._sent) throw new Error('request already sent')
	this.post.content = content
	return this.stream
}
Create.prototype.permissions = function(arg) {
	if(this._sent) throw new Error('request already sent')
	// arg boolean: set public / not public
	// arg string/array: public false, set entities and/or groups

	this.post.permissions = this.post.permissions || {}

	if(typeof arg === 'boolean') {
		this.post.permissions.public = arguments[0]
		return this.stream
	}

	this.post.permissions.public = false

	if(typeof arg === 'string') arg = [arg]

	var that = this
	arg.forEach(function(id) {
		var parsed = url.parse(id)

		// entity or group id?
		if(parsed.protocol === 'https:' || parsed.protocol === 'http:') {
			that.post.permissions.entities = that.post.permissions.entities || []
			that.post.permissions.entities.push(id)
		} else { // group id
			that.post.permissions.groups = that.post.permissions.groups || []
			that.post.permissions.groups.push({ post: id })
		}
	})
	return this.stream
}
Create.prototype.attachments = function() {
	console.log('TODO')
}
Create.prototype.refs = function() {
	console.log('TODO')
}
Create.prototype.print = function() {
	return this.post
}
Create.prototype._send = function() {
	if(!this.post.type) {
		var message = 'no post type defined'
		if(this.callback) return this.callback(message)
		else throw new Error(message)
	}

	var req = hyperquest.post(this.urls.new_post)
	req.setHeader('Content-Type',
		'application/vnd.tent.post.v0+json; type="' + this.post.type + '"')

	finishReq(req, this)

	req.end(JSON.stringify(this.post))

	return req
}

function Query(urls, auth, callback) {
	this.urls = urls
	this.auth = auth
	this.callback = callback || false
	
	this.query = {}
	this.method = 'GET'

	this.stream = through()
	setupStream(this.stream, this)

	return this.stream
}

Query.prototype._send = function() {
	var url = this.urls.posts_feed
	var param = qs.stringify(this.query)
	param = param.replace(/%2C/g, ',')
	param = param.replace(/%2B/g, '+')

	if(param) url += '?' + param

	var req = hyperquest(url, { method: this.method })
	req.setHeader('Accept', 'application/vnd.tent.posts-feed.v0+json')

	finishReq(req, this)

	return req
}

Query.prototype.limit = function(limit) {
	if(this._sent) throw new Error('request already sent')
	this.query.limit = limit
	return this.stream
}
Query.prototype.sortBy = function(sorting) {
	if(this._sent) throw new Error('request already sent')
	this.query.sort_by = sorting
	return this.stream
}
Query.prototype.since = function(since) {
	if(this._sent) throw new Error('request already sent')
	this.query.since = since
	return this.stream
}
Query.prototype.until = function(until) {
	if(this._sent) throw new Error('request already sent')
	this.query.until = until
	return this.stream
}
Query.prototype.before = function(before) {
	if(this._sent) throw new Error('request already sent')
	this.query.before = before
	return this.stream
}
Query.prototype.types = function(arg) {
	if(this._sent) throw new Error('request already sent')
	if(typeof arg === 'string') arg = [arg]
	this.query.types = arg.join()
	return this.stream
}

Query.prototype.entities = function(arg) {
	if(this._sent) throw new Error('request already sent')
	if(typeof arg === 'string') arg = [arg]

	this.query.entities = arg.join()
	return this.stream
}
Query.prototype.mentions = function() {
	if(this._sent) throw new Error('request already sent')
	var query = this.query.mentions = []
	for(var i = 0; arguments.length > i; i++) {
		var arg = arguments[i]
		if(Array.isArray(arg))  //AND operator
			query.push(arg.join(','))
		else if(typeof arg === 'string') //OR operator
			query.push(arg)
	}

	return this.stream
}
Query.prototype.count = function() {
	if(this._sent) throw new Error('request already sent')
	this.method = 'HEAD'
	return this.stream
}
Query.prototype.print = function() {
	return this.query
}


function Get(urls, auth, clientEntity, entity, id, callback) {
	this.urls = urls
	this.auth = auth

	if(!entity) throw new Error('post id required')

	//.get(entity, id[, cb])
	this.entity = entity
	this.id = id
	this.callback = callback || false

	if(!id && !callback) { //.get(id)
		this.entity = clientEntity
		this.id = entity
	}
	if(typeof id === 'function') { //.get(id, cb)
		this.entity = clientEntity
		this.id = entity
		this.callback = id
	}


	this.acceptHeader = 'application/vnd.tent.post.v0+json'
	this.method = 'GET'
	this.version = false

	this.stream = through()
	setupStream(this.stream, this)

	return this.stream
}

Get.prototype.mentions = function() {
	if(this._sent) throw new Error('request already sent')
	this.acceptHeader = 'application/vnd.tent.post-mentions.v0+json'
	return this.stream
}
Get.prototype.versions = function() {
	if(this._sent) throw new Error('request already sent')
	this.acceptHeader = 'application/vnd.tent.post-versions.v0+json'
	return this.stream
}
Get.prototype.childVersions = function(version) {
	if(this._sent) throw new Error('request already sent')
	this.acceptHeader = 'application/vnd.tent.post-children.v0+json'
	if(version) this.version = version
	return this.stream
}
Get.prototype.count = function() {
	if(this._sent) throw new Error('request already sent')
	this.method = 'HEAD'
	return this.stream
}
Get.prototype.delete = function() {
	if(this._sent) throw new Error('request already sent')
	this.method = 'DELETE'
	return this.stream
}

Get.prototype.print = function() {
	return [
		this.acceptHeader,
		this.method,
		this.version
	]
}

Get.prototype._send = function() {
	var tpl = urlParser.parse(this.urls.post)
	var url = tpl.expand({ entity: this.entity, post: this.id })
	if(this.version) url += '?version=' + this.version

	var req = hyperquest(url, { method: this.method })
	req.setHeader('Accept', this.acceptHeader)

	finishReq(req, this) //bad style blabla

	return req
}

function Update(urls, auth, entity, id, parent, callback) {
	this.urls = urls
	this.auth = auth
	this.entity = entity

	if(!entity) throw new Error('post id required to update a post')
	if(!parent) throw new Error('parent hash required to update a post') //?!
	
	this.id = id
	this.parent = parent
	this.callback = callback || false

	this.post = {}

	this.stream = through()
	setupStream(this.stream, this)

	return this.stream
}
Update.prototype.type = function(type) {
	if(this._sent) throw new Error('request already sent')
	this.post.type = type
	return this.stream
}
Update.prototype.content = function(content) {
	if(this._sent) throw new Error('request already sent')
	this.post.content = content
	return this.stream
}

Update.prototype._send = function() {
	var tpl = urlParser.parse(this.urls.post)
	var url = tpl.expand({ entity: this.entity, post: this.id })

	this.post.version = this.post.version || {}
	this.post.version.parents = []
	this.post.version.parents.push({ version: this.parent })

	var req = hyperquest.put(url)
	req.setHeader('Content-Type',
		'application/vnd.tent.post.v0+json; type="'+this.post.type+'"')

	finishReq(req, this)

	req.end(JSON.stringify(this.post))

	console.log(req.request)

	return req
}

function Destroy(urls, auth, entity, id, callback) { //aka delete
	this.urls = urls
	this.auth = auth
	this.entity = entity

	if(!id) throw new Error('post id required to delete post')

	this.id = id
	this.callback = callback || false

	//this.acceptHeader ?!
	this.versionQuery = false
	this.createDeletePostHeader = null

	this.stream = through()
	setupStream(this.stream, this)

	return this.stream
}
Destroy.prototype.version = function(version) {
	if(this._sent) throw new Error('request already sent')
	this.versionQuery = version
	return this.stream
}
Destroy.prototype.createDeletePost = function(bool) {
	if(this._sent) throw new Error('request already sent')
	this.createDeletePostHeader = bool
	return this.stream
}
Destroy.prototype._send = function() {
	var tpl = urlParser.parse(this.urls.post)
	var url = tpl.expand({ entity: this.entity, post: this.id })
	if(this.versionQuery) url += '?version=' + this.versionQuery
	
	var req = hyperquest.delete(url)
	
	if(typeof this.createDeletePostHeader === 'boolean')
		req.setHeader('Create-Delete-Post', this.createDeletePostHeader)

	finishReq(req, this)

	console.log(req.request)
	return req
}


// https://github.com/substack/hyperquest/blob/master/index.js <3
function bind(obj, fn) {
  var args = Array.prototype.slice.call(arguments, 2)
  return function () {
    args = args.concat(Array.prototype.slice.call(arguments))
    return fn.apply(obj, args)
  }
}
function setupStream(stream, that) {
	stream.writable = false

	for(var key in that.__proto__) {
		if(!(/^_/.test(key))) //function name begins with _ (e.g. _send)
			stream[key] = bind(that, that[key])
	}

	stream['base'] = that

	var closed = false
	stream.on('close', function() { closed = true })

	process.nextTick(function() {
		if(closed) return
		stream.on('close', function() {  req.destroy() })

		var req = that._send()
		req.on('error', bind(stream, stream.emit, 'error'))

		req.on('response', function(res) {
			stream.emit('response', res)

			res.on('data', function(buf) { stream.queue(buf) })
			res.on('end', function() { stream.queue(null) })
		})
	})
}

function finishReq(req, that) {
	that._sent = true

	if(that.auth) {
		var auth = hawk.client.header(req.request.uri, req.request.method, { credentials: that.auth })
		req.request.headers.Authorization = auth.field //no clue why .setHeader() doesnt work
	}

	if(!that.callback) return req //breakpoint

	var response
	req.on('response', function (res) {
		response = res
	})
	
	var cb = that.callback
	req.pipe(concat(function(err, body) {
		if(err) return cb(err)

		if(req.request.method === 'HEAD')
			body = Number(response.headers.count)
		else try {
			body = JSON.parse(body)
		} catch(e) {}

		cb(err, response, body)
	}))

	if(that.method === 'HEAD')
		req.end() //bug in hyperquest: returns duplex stream
}