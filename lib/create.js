var request = require('./request')
var utils = require('./utils')
var debug = require('debug')('tent-request:create')
var Multipart = require('multipart-stream')
var stream = require('stream')

/**
 * Creates a new post.
 * @param  {object} meta - Content part of meta post.
 * @param  {string} type - Post type.
 * @param  {object} metadata - Metadata of post: publishedAt, mentions, licenses, permissions.
 * @param  {object} content - Content part of post.
 * @return {object} - Describes the request.
 */
module.exports = function Create(meta, type, metadata, content) {
	metadata = metadata || null
	content = content || null

	if(!type) throw new Error('type required')

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

	var url = meta.servers[0].urls.new_post

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

	if(metadata && metadata.attachments) {
		var attas = metadata.attachments

		var mp = new Multipart()
		var jsonPost = JSON.stringify(post)

		mp.addPart({
			headers: {
				'Content-Disposition': 'form-data; name="post"; filename="post.json"',
				'Content-Type': 'application/vnd.tent.post.v0+json; type="'+ post.type +'"',
				'Content-Length': Buffer.byteLength(jsonPost)
			},
			body: jsonPost
		})

		if(!Array.isArray(attas)) {
			attas = [attas]
		}

		attas.forEach(function(atta) {
			var contentDisposition = 'form-data; name="'+ atta.category +'"; filename="'+ atta.name +'"'
			var size = atta.size
			
			if(!atta.data) {
				size = 0
			}

			if(!atta.size && typeof atta.size !== 'number') {
				if(atta.data instanceof stream) {
					throw new Error('if attachment.data is a stream, attachment.size is required')
				} else if(Buffer.isBuffer(atta.data)) {
					size = atta.data.length
				} else {
					size = Buffer.byteLength(atta.data.toString())
				}
			}

			mp.addPart({
				headers: {
					'Content-Disposition': contentDisposition,
					'Content-Type': atta.type,
					'Content-Length': size
				},
				body: atta.data
			})
		})

		var reqOpts =  {
			url: url,
			method: 'POST',
			headers: {
				'Content-Type': 'multipart/form-data; boundary='+ mp.boundary
			},
			body: mp
		}

	} else {
		var reqOpts =  {
			url: url,
			method: 'POST',
			headers: {
				'Content-Type':
					'application/vnd.tent.post.v0+json; type="'+post.type+'"'
			},
			body: JSON.stringify(post)
		}
	}

	debug('', reqOpts)

	return reqOpts
}