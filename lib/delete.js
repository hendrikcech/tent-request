var request = require('./request')
var urlParser = require('uri-template')

module.exports = function(url, auth, entity, id, opts, cb) {
	var tpl = urlParser.parse(url)
	var reqUrl = tpl.expand({ entity: entity, post: id })
	if(opts && opts.version) reqUrl += '?version=' + opts.version

	var req = request(reqUrl, 'DELETE', auth, cb)

	if(opts && typeof opts.createDeletePost === 'boolean')
		req.setHeader('Create-Delete-Post', opts.createDeletePost)

	req.end()

	return req
}

/*
client.delete(id, opts, cb)

## opts:
- version to delete
- createDeletePost
*/

module.exports.checkArgs = function(id, opts, cb) {
	if(!id) throw new Error('id required')

	opts = opts || null
	cb = cb || null

	if(typeof opts === 'function') {
		cb = opts
		opts = null
	}

	return [id, opts, cb]
}