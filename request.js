var hyperquest = require('hyperquest')
var urlMod = require('url')
var concat = require('concat-stream')
var hawk = require('hawk')
var qs = require('querystring')
var urlParser = require('uri-template')
var through = require('through')
var util = require('util')

exports.createClient = function(meta, auth) {
	if(!meta) throw new Error('meta post required')
	return new Client(meta, auth)
}

var Client = function(meta, auth) {
	if(!meta) throw new Error('meta post required')

	// test if browserified version runs on the client on a "non-standard" port.
	// if so, explicitly append the port to the urls to prevent xhr calls
	// going to the local port instead of the intended standard port
	// (80 for http and 443 for https)
	if(typeof window !== 'undefined' && window.location.port) {
		meta.servers.forEach(function(server) {
			var urls = server.urls
			for(var url in urls) {
				var parsed = urlMod.parse(urls[url])
				var port = null
				if(!parsed.port) {
					if(parsed.protocol === 'http:') port = 80
					else if(parsed.protocol === 'https:') port = 443
				}
				if(port) {
					parsed.port = port
					parsed.host += ':' + port //why, just why?!
					urls[url] = urlMod.format(parsed)
				}
			}
		})
	}

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
Client.prototype.get = function(id, entity, callback) {
	return new Get(this.meta.servers[0].urls, this.auth,
		this.meta.entity, id, entity, callback)
}
Client.prototype.update = function(id, parent, callback) {
	return new Update(this.meta.servers[0].urls, this.auth,
		this.meta.entity, id, parent, callback)
}
Client.prototype.delete = function(id, callback) {
	return new Destroy(this.meta.servers[0].urls, this.auth, this.meta.entity,
		id, callback)
}


function Create(urls, auth, type, callback) {
	this.urls = urls
	this.auth = auth

	this.post = {}

	if(typeof type === 'string') this.post.type = type
	else if(typeof type === 'object') this.post = type
	else if(typeof type === 'function') this.callback = type
	
	this.callback = callback || false

	this.stream = through()
	setupStream(this.stream, this)
	
	return this.stream
}

util.inherits(Create, postSetter)

Create.prototype.publishedAt = function(time) {
	if(this._sent) throw new Error('request already sent')
	if(time === null) delete this.query.published_at
	else this.post.published_at = time
	return this.stream
}

Create.prototype.attachments = function() {
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
	if(limit === null) delete this.query.limit
	else this.query.limit = limit
	return this.stream
}
Query.prototype.sortBy = function(sorting) {
	if(this._sent) throw new Error('request already sent')
	if(sorting === null) delete this.query.sort_by
	else this.query.sort_by = sorting
	return this.stream
}
Query.prototype.since = function(since) {
	if(this._sent) throw new Error('request already sent')
	if(since === null) delete this.query.since
	this.query.since = since
	return this.stream
}
Query.prototype.until = function(until) {
	if(this._sent) throw new Error('request already sent')
	if(until === null) delete this.query.until
	else this.query.until = until
	return this.stream
}
Query.prototype.before = function(before) {
	if(this._sent) throw new Error('request already sent')
	if(before === null) delete this.query.before
	else this.query.before = before
	return this.stream
}
Query.prototype.types = function(arg) {
	if(this._sent) throw new Error('request already sent')
	if(arg === null) delete this.query.types
	else {
		if(typeof arg === 'string') arg = [arg]
		this.query.types = this.query.types || ''
		this.query.types = this.query.types.split(',')
		if(this.query.types[0] === '') this.query.types = []
		this.query.types = this.query.types.concat(arg).join()
	}
	return this.stream
}

Query.prototype.entities = function(arg) {
	if(this._sent) throw new Error('request already sent')
	if(arg === null) delete this.query.entities
	else {
		if(typeof arg === 'string') arg = [arg]
		this.query.entities = this.query.entities || ''
		this.query.entities = this.query.entities.split(',')
		if(this.query.entities[0] === '') this.query.entities = []
		this.query.entities = this.query.entities.concat(arg).join()
	}
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


function Get(urls, auth, clientEntity, id, entity, callback) {
	this.urls = urls
	this.auth = auth

	if(!id) throw new Error('post id required')

	//.get(id, entity[, cb])
	this.id = id
	this.entity = entity
	this.callback = callback || false

	if(!entity && !callback) { //.get(id)
		this.id = id
		this.entity = clientEntity
	}
	if(typeof entity === 'function') { //.get(id, cb)
		this.id = id
		this.entity = clientEntity
		this.callback = entity
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

function Update(urls, auth, entity, id, parents, callback) {
	this.urls = urls
	this.auth = auth
	this.entity = entity

	if(!id) throw new Error('post id required to update a post')
	this.id = id
	
	this.post = { version: { parents: [] }}

	this.callback = false

	if(typeof parents === 'function') //(id, cb)
		this.callback = parents
	else if(parents) //(id, parents, ..?)
		this.parents(parents)

	if(callback) this.callback = callback //(id, parents, cb)

	this.stream = through()
	setupStream(this.stream, this)

	return this.stream
}

util.inherits(Update, postSetter)

Update.prototype.versionMessage = function(message) {
	if(this._sent) throw new Error('request already sent')
	if(message === null) delete this.post.version.message
	else this.post.version.message = message
	return this.stream
}
Update.prototype.versionPublishedAt = function(publishedAt) {
	if(this._sent) throw new Error('request already sent')
	if(publishedAt === null) delete this.post.version.published_at
	else this.post.version.published_at = publishedAt
	return this.stream
}	
Update.prototype.parents = function(arg) {
	if(this._sent) throw new Error('request already sent')
	if(arg === null) {
		delete this.post.version.parents
		this.post.version = {}
		this.post.version.parents = []
		return this.stream
	}

	if(!Array.isArray(arg)) arg = [arg] //actually just one parent

	arg.forEach(function(parent) {
		if(typeof parent === 'object') //parent hash
			this.post.version.parents.push(parent)
		else
			this.post.version.parents.push({ version: parent })
	}.bind(this))

	return this.stream
}

Update.prototype._send = function() {
	var tpl = urlParser.parse(this.urls.post)
	var url = tpl.expand({ entity: this.entity, post: this.id })

	var req = hyperquest.put(url)
	req.setHeader('Content-Type',
		'application/vnd.tent.post.v0+json; type="'+this.post.type+'"')

	finishReq(req, this)

	req.end(JSON.stringify(this.post))

	//console.log(req.request)
	//console.log(JSON.stringify(this.post))

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

	//console.log(req.request)
	return req
}

function postSetter() {}
postSetter.prototype.mentions = function(arg) {
	if(this._sent) throw new Error('request already sent')
	if(arg === null) delete this.post.mentions
	else {
		this.post.mentions = this.post.mentions || []

		if(!Array.isArray(arg)) arg = [arg]

		arg.forEach(function(mention) {
			this.post.mentions.push(mention)
		}.bind(this))
	}
	return this.stream
}
postSetter.prototype.licenses = function(arg) {
	if(this._sent) throw new Error('request already sent')
	if(arg === null) delete this.post.licenses
	this.post.licenses = this.post.licenses || []

	if(!Array.isArray(arg)) arg = [arg]

	arg.forEach(function(licenseURL) {
		this.post.licenses.push({ url: licenseURL })
	}.bind(this))

	return this.stream
}
postSetter.prototype.type = function(type) {
	if(this._sent) throw new Error('request already sent')
	if(type === null) delete this.post.type
	else this.post.type = type
	return this.stream
}
postSetter.prototype.content = function(content) {
	if(this._sent) throw new Error('request already sent')
	if(content === null) delete this.post.content
	else this.post.content = content
	return this.stream
}
postSetter.prototype.permissions = function(arg) {
	if(this._sent) throw new Error('request already sent')
	// arg boolean: set public / not public
	// arg string/array: public false, set entities and/or groups

	if(arg === null) {
		delete this.post.permissions
		return this.stream
	}

	this.post.permissions = this.post.permissions || {}

	if(typeof arg === 'boolean') {
		this.post.permissions.public = arguments[0]
		return this.stream
	}

	this.post.permissions.public = false

	if(typeof arg === 'string') arg = [arg]

	arg.forEach(function(id) {
		var parsed = urlMod.parse(id)

		// entity or group id?
		if(parsed.protocol === 'https:' || parsed.protocol === 'http:') {
			this.post.permissions.entities = this.post.permissions.entities || []
			this.post.permissions.entities.push(id)
		} else { // group id
			this.post.permissions.groups = this.post.permissions.groups || []
			this.post.permissions.groups.push({ post: id })
		}
	}.bind(this))
	return this.stream
}
postSetter.prototype.refs = function() {
	console.log('TODO')
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
		res.setEncoding('utf8')
	})
	
	var cb = that.callback
	req.pipe(concat(function(err, body) {
		if(err) return cb(err)

		if(req.request.method === 'HEAD')
			body = Number(response.headers.count)
		else try {
			body = JSON.parse(body)
		} catch(e) {}

		if(response.statusCode !== 200 || (body && body.error))
			return cb(response.statusCode
				+ ((body && body.error) ? ': ' + body.error : '')
				, response)

		cb(err, response, body)
	}))

	if(that.method === 'HEAD')
		req.end() //bug in hyperquest: returns duplex stream
}