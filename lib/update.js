var utils = require('./utils')
var request = require('./request')
var debug = require('debug')('tent-request:update')

module.exports = function(meta, id, parents, type, metadata, content) {
	if(!id || !parents || !type) {
		throw new Error('at least id, parents version id and type required')
	}

	if(typeof parents === 'object' && !parents.version) {
		throw new Error('parents must be string with parents version id or object with at least the `version` key')
	}

	metadata = metadata || null
	content = content || null

	if(metadata && typeof metadata === 'object') {
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

	var post = {}
	post.type = type
	post.content = content || {}

	post.version = {}
	post.version.parents = setParents(parents)

	if(metadata) {
		for(var key in metadata) {
			var val = metadata[key]
			if(key === 'versionMessage') {
				post.version.message = utils.metadataSetter[key](val)
			} else if(key === 'versionPublishedAt') {
				post.version.published_at = utils.metadataSetter[key](val)
			} else {
				post[key] = utils.metadataSetter[key](val)
			}
		}
		if(post.publishedAt) {
			post.published_at = post.publishedAt
			delete post.publishedAt
		}
	}

	var url = meta.servers[0].urls.post
	var contentType = 'application/vnd.tent.post.v0+json; type="'+type+'"'
	var encEntity = encodeURIComponent(meta.entity)
	var encID = encodeURIComponent(id)

	var reqOpts = {
		url: url.replace('{entity}', encEntity).replace('{post}', encID),
		method: 'PUT',
		headers: {
			'Content-Type': contentType
		},
		body: JSON.stringify(post)
	}

	debug('', reqOpts)

	return reqOpts
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