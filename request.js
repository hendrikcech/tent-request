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
Client.prototype.newPost = function(type, callback) {
	//if(!this.auth) 
	return new newPost(this.meta.urls, this.auth, type, callback)
}
Client.prototype.getPosts = function(callback) {
	return new getPosts(this.meta.urls, this.auth, callback)
}
Client.prototype.getPost = function(entity, id, callback) {
	return new getPost(this.meta.urls, this.auth, entity, id, callback)
}

function newPost(urls, auth, type, callback) {
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

newPost.prototype.published_at = function(time) {
	if(this._sent) throw new Error('request already sent')
	this.post.published_at = time
	return this.stream
}
newPost.prototype.mention = function(arg) {
	if(this._sent) throw new Error('request already sent')
	this.post.mentions = this.post.mentions || []

	if(!Array.isArray(arg)) arg = [arg]

	var that = this
	arg.forEach(function(mention) {
		that.post.mentions.push(mention)
	})

	return this.stream
}
newPost.prototype.license = function(arg) {
	if(this._sent) throw new Error('request already sent')
	this.post.licenses = this.post.licenses || []

	if(!Array.isArray(arg)) arg = [arg]

	var that = this
	arg.forEach(function(licenseURL) {
		that.post.licenses.push({ url: licenseURL })
	})

	return this.stream
}
newPost.prototype.type = function(type) {
	if(this._sent) throw new Error('request already sent')
	this.post.type = type
	return this.stream
}
newPost.prototype.content = function(content) {
	if(this._sent) throw new Error('request already sent')
	this.post.content = content
	return this.stream
}
newPost.prototype.permissions = function(arg) {
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
newPost.prototype.print = function() {
	return this.post
}
newPost.prototype._send = function() {
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

function getPosts(urls, auth, callback) {
	this.urls = urls
	this.auth = auth
	this.callback = callback || false
	this.query = {}

	this.stream = through()
	setupStream(this.stream, this)

	return this.stream
}

getPosts.prototype._send = function() {
	var url = this.urls.posts_feed
	var param = qs.stringify(this.query)
	if(param) url += '?' + param

	var req = hyperquest.get(url)
	req.setHeader('Accept', 'application/vnd.tent.posts-feed.v0+json')

	finishReq(req, this)

	return req
}

getPosts.prototype.limit = function(limit) {
	if(this._sent) throw new Error('request already sent')
	this.query.limit = limit
	return this.stream
}
getPosts.prototype.sort_by = function(sorting) {
	if(this._sent) throw new Error('request already sent')
	this.query.sort_by = sorting
	return this.stream
}
getPosts.prototype.since = function(since) {
	if(this._sent) throw new Error('request already sent')
	this.query.since = since
	return this.stream
}
getPosts.prototype.until = function(until) {
	if(this._sent) throw new Error('request already sent')
	this.query.until = until
	return this.stream
}
getPosts.prototype.before = function(before) {
	if(this._sent) throw new Error('request already sent')
	this.query.before = before
	return this.stream
}
getPosts.prototype.types = function(arg) {
	if(this._sent) throw new Error('request already sent')
	if(typeof arg === 'string') arg = [arg]
	this.query.types = commaSeperate(arg)
	return this.stream
}

function commaSeperate(items) { //array
	var res = ''
	items.forEach(function(item, index) {
		if(index === 0) res = item //is it the first item?
		else res += ',' + item
	})
	return res
}

getPosts.prototype.entities = function(arg) {
	if(this._sent) throw new Error('request already sent')
	if(typeof arg === 'string') arg = [arg]

	this.query.entities = commaSeperate(arg)
	return this.stream
}
getPosts.prototype.mentions = function(arg) {
	if(this._sent) throw new Error('request already sent')
	//TODO
	return this.stream
}
getPosts.prototype.print = function() {
	return this.query
}


function getPost(urls, auth, entity, id, callback) {
	if(!entity) throw new Error('entity required')
	if(!id) throw new Error('post id required')
	this.urls = urls
	this.auth = auth
	this.entity = entity
	this.id = id
	this.callback = callback || false

	this.acceptHeader = 'application/vnd.tent.post.v0+json'
	this.method = 'GET'
	this.version = false

	this.stream = through()
	setupStream(this.stream, this)

	return this.stream
}

getPost.prototype.mentions = function() {
	if(this._sent) throw new Error('request already sent')
	this.acceptHeader = 'application/vnd.tent.post-mentions.v0+json'
	return this.stream
}
getPost.prototype.versions = function() {
	if(this._sent) throw new Error('request already sent')
	this.acceptHeader = 'application/vnd.tent.post-versions.v0+json'
	return this.stream
}
getPost.prototype.childVersions = function(version) {
	if(this._sent) throw new Error('request already sent')
	this.acceptHeader = 'application/vnd.tent.post-children.v0+json'
	if(version) this.version = version
	return this.stream
}
getPost.prototype.count = function() {
	if(this._sent) throw new Error('request already sent')
	this.method = 'HEAD'
	return this.stream
}

getPost.prototype.print = function() {
	return [
		this.acceptHeader,
		this.method,
		this.version
	]
}

getPost.prototype._send = function() {
	var tpl = urlParser.parse(this.urls.post)
	var url = tpl.expand({ entity: this.entity, post: this.id })
	if(this.version) url += '?=' + this.version

	var req = hyperquest(url, { method: this.method })
	req.setHeader('Accept', this.acceptHeader)

	finishReq(req, this) //bad style blabla

	if(this.method === 'HEAD')
		req.end() //bug in hyperquest: returns duplex stream

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
}