var utils = require('./utils')
var request = require('./request')
var urlParser = require('uri-template')
var debug = require('debug')('tent-request')

module.exports = function(url, auth, entity, id, parents, type, metadata, content, cb) {

	var post = {}
	post.type = type
	post.content = content || {}

	post.version = {}
	post.version.parents = setParents(parents)

	if(metadata) {
		for(var key in metadata) {
			var val = metadata[key]
			if(key === 'versionMessage')
				post.version.message = val
			else if(key === 'versionPublishedAt')
				post.version.published_at = val
			else
				post[key] = utils.metadataSetter[key](val)
		}
		if(post.publishedAt) {
			post.published_at = post.publishedAt
			delete post.publishedAt
		}
	}

	var tpl = urlParser.parse(url)
	var reqUrl = tpl.expand({ entity: entity, post: id })

	var req = request(reqUrl, 'PUT', auth, cb)

	var contentType = 'application/vnd.tent.post.v0+json; type="'+ post.type+'"'
	req.setHeader('Content-Type', contentType)

	req.write(JSON.stringify(post))
	req.end()

	if(req._headers) debug('req headers:\n', req._headers)

	return req
}

function setParents(arg) {
	var parents = []

	if(!Array.isArray(arg)) arg = [arg] //actually just one parent

	arg.forEach(function(parent) {
		if(typeof parent === 'object') //parent hash
			parents.push(parent)
		else
			parents.push({ version: parent })
	})

	return parents
}

module.exports.checkArgs = function(id, parent, type, metadata, content, cb) {
	if(!id || !parent || !type)
		throw new Error('at id, parent version id and type required')

	if(typeof parent === 'object' && !parent.version)
		throw new Error('parent must be string with parent version id or object with at least the `version` key')

	metadata = metadata || null
	content = content || null
	cb = cb || null

	if(typeof content === 'function') {
		cb = content
		content = null
	}

	if(typeof metadata === 'function') {
		cb = metadata
		metadata = null
	} else if(metadata && typeof metadata === 'object') {
		var keys = Object.keys(metadata)
		for(var i = 0; i < keys.length; i++) {
			if(!utils.metadataSetter[keys[i]]) {
				// its a custom key -> content
				content = metadata
				metadata = null
				break
			}
		}		
	}

	return [id, parent, type, metadata, content, cb]
}
