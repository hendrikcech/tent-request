var request = require('./request')
var debug = require('debug')('tent-request')

module.exports = function(url, auth, entity, id, opts, cb) {
	var encEntity = encodeURIComponent(entity)
	var encID = encodeURIComponent(id)

	var reqUrl = url.replace('{entity}', encEntity).replace('{post}', encID)

	if(opts && opts.version) reqUrl += '?version=' + opts.version

	var req = request(reqUrl, 'DELETE', auth, cb)

	if(opts && typeof opts.createDeletePost === 'boolean')
		req.setHeader('Create-Delete-Post', opts.createDeletePost)

	req.end()

	if(req._headers) debug('req headers:\n', req._headers)

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