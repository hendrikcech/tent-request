var hyperquest = require('hyperquest')
var url = require('url')
var EventEmitter = require('events').EventEmitter
var util = require('util')
var concat = require('concat-stream')
var hawk = require('hawk')
var qs = require('querystring')

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

Client.prototype.newPost = function(type) {
	//if(!this.auth) 
	return new Post(type, this.meta.urls, this.auth)
}

Client.prototype.getPosts = function() {
	return new Query(this.meta.urls, this.auth)
}

function Post(type, urls, auth) {
	this.urls = urls
	this.auth = auth
	this.post = {}
	if(type) this.post.type = type
	return this
}

util.inherits(Post, EventEmitter)

Post.prototype.published_at = function(time) {
	this.post.published_at = time
	return this
}
Post.prototype.mention = function(arg) {
	this.post.mentions = this.post.mentions || []

	if(!Array.isArray(arg)) arg = [arg]

	var that = this
	arg.forEach(function(mention) {
		that.post.mentions.push(mention)
	})

	return this
}
Post.prototype.license = function(arg) {
	this.post.licenses = this.post.licenses || []

	if(!Array.isArray(arg)) arg = [arg]

	var that = this
	arg.forEach(function(licenseURL) {
		that.post.licenses.push({ url: licenseURL })
	})

	return this
}
Post.prototype.type = function(type) {
	this.post.type = type
	return this
}
Post.prototype.content = function(content) {
	this.post.content = content
	return this
}
Post.prototype.permissions = function(arg) {
	// arg boolean: set public / not public
	// arg string/array: public false, set entities and/or groups

	this.post.permissions = this.post.permissions || {}

	if(typeof arg === 'boolean') {
		this.post.permissions.public = arguments[0]
		return this
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
	return this
}
Post.prototype.print = function() {
	return this.post
}
Post.prototype.create = function(callback) {
	if(!this.post.type) {
		var message = 'no post type defined'
		this.emit('error', message)
		if(callback) callback(message)
		return
	}

	var req = hyperquest.post(this.urls.new_post)
	req.setHeader('Content-Type', 'application/vnd.tent.post.v0+json; type="' + this.post.type + '"')

	if(this.auth) {
		var auth = hawk.client.header(this.urls.new_post, 'POST', { credentials: this.auth })
		req.request.headers.Authorization = auth.field //no clue why .setHeader() doesnt work
	}

	req.end(JSON.stringify(this.post))

	var that = this

	var response
	req.on('response', function (res) {
		response = res
		that.emit('response', res)
	})
	
	req.pipe(concat(function(err, body) {
		if(err) return that.emit('error', err)
		try {
			body = JSON.parse(body)
		} catch(e) {
			console.log(e)
		}

		that.emit('body', body)

		if(callback) callback(err, response, body)
	}))

	return this
}

function Query(urls, auth) {
	this.urls = urls
	this.auth = auth
	this.query = {}
}

util.inherits(Query, EventEmitter)

Query.prototype.limit = function(limit) {
	this.query.limit = limit
	return this
}
Query.prototype.sort_by = function(sorting) {
	this.query.sort_by = sorting
	return this
}
Query.prototype.since = function(since) {
	this.query.since = since
	return this
}
Query.prototype.until = function(until) {
	this.query.until = until
	return this
}
Query.prototype.before = function(before) {
	this.query.before = before
	return this
}
Query.prototype.types = function(arg) {
	if(typeof arg === 'string') arg = [arg]

	this.query.types = commaSeperate(arg)
	return this
}

function commaSeperate(items) { //array
	var res = ''
	items.forEach(function(item, index) {
		if(index === 0) res = item //is it the first item?
		else res += ',' + item
	})
	return res
}

Query.prototype.entities = function(arg) {
	if(typeof arg === 'string') arg = [arg]

	this.query.entities = commaSeperate(arg)
	return this
}
Query.prototype.mentions = function(arg) {
	console.log('TODO')
	return this
}
Query.prototype.print = function() {
	return this.query
}
Query.prototype.send = function(callback) {
	var url = this.urls.posts_feed
	var param = qs.stringify(this.query)
	if(param) url += '?' + param

	var req = hyperquest.get(url)
	req.setHeader('Accept', 'application/vnd.tent.posts-feed.v0+json')

	if(this.auth) {
		var auth = hawk.client.header(url, 'GET', { credentials: this.auth })
		req.request.headers.Authorization = auth.field //no clue why .setHeader() doesnt work
	}

	var that = this
	var response
	req.on('response', function (res) {
		response = res
		that.emit('response', res)
	})
	
	req.pipe(concat(function(err, body) {
		if(err) return that.emit('error', err)
		try {
			body = JSON.parse(body)
		} catch(e) {
			console.log(e)
		}

		that.emit('body', body)

		if(callback) callback(err, response, body)
	}))
}