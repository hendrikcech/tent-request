var request = require('./request')
var utils = require('./utils')

module.exports = function Create(url, auth, type, metadata, content, cb) {
	var post = {}
	post.type = type
	post.content = content || {}

	if(metadata) {
		for(var key in metadata) {
			var val = metadata[key]
			post[key] = utils.metadataSetter[key](val)
		}
		if(post.publishedAt) {
			post.published_at = post.publishedAt
			delete post.publishedAt
		}
	}

	var req = request(url, 'POST', auth, cb)

	req.setHeader('Content-Type',
		'application/vnd.tent.post.v0+json; type="' + post.type + '"')

	req.write(JSON.stringify(post))
	req.end()

	return req
}

module.exports.checkArgs = function(type, metadata, content, cb) {
	metadata = metadata || null
	content = content || null
	cb = cb || null	

	if(!type) throw new Error('type required')

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

	return [type, metadata, content, cb]
}