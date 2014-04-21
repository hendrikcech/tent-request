var request = require('./request')
var debug = require('debug')('tent-request:delete')

/**
 * Deletes an existing post
 * @param  {object} meta
 * @param  {string} id
 * @param  {object} opts
 * @property {string} version - Version to delete.
 * @property {boolean} createDeletePost - Default: false
 * @return {object} reqOpts
 */
module.exports = function(meta, id, opts) {
	if(!id) throw new Error('id required')
	opts = opts || {}

	var url = meta.servers[0].urls.post

	var headers = {}

	if(opts.version) { 
		url += '?version=' + opts.version
	}
	if(typeof opts.createDeletePost === 'boolean') {
		headers['Create-Delete-Post'] = opts.createDeletePost
	}

	var encEntity = encodeURIComponent(meta.entity)
	var encID = encodeURIComponent(id)

	var reqOpts = {
		url: url.replace('{entity}', encEntity).replace('{post}', encID),
		method: 'DELETE',
		headers: headers
	}

	debug('', reqOpts)

	return reqOpts
}