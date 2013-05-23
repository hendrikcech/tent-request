var hyperquest = require('hyperquest')
var url = require('url')
var EventEmitter = require('events').EventEmitter
var util = require('util')
var concat = require('concat-stream')
var hawk = require('hawk')

exports.createClient = function(meta, auth) {
	if(!meta) throw new Error('meta post required')
	return new Client(meta, auth)
}

var Client = function(meta, auth) {
	this.meta = meta
	this.auth = auth
}

Client.prototype.newPost = function(type) {
	//if(!this.auth) 
	return new Post(this.meta.urls, type)
}

Client.prototype.queryPost = function() {
	return new Query(this.meta.urls)
}

function Post(urls, type) {
	this.urls = urls
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
	//if(!this.post.type) //emit error
	var req = hyperquest.post(this.urls.new_post)
	req.setHeader('Content-Type', 'application/vnd.tent.post.v0+json; type="' + this.post.type + '"')
	
	//TODO: Hawk Auth
	
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

function Query(urls) {
	this.urls = urls
	this.query = {}
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