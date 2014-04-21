var request = require('./request')
var utils = require('./utils')
var querystring = require('querystring')
var debug = require('debug')('tent-request:get')

/**
 * Returns a single post.
 * @param  {object} meta
 * @param  {array}  mode
 * @param  {string} id
 * @param  {string} entity
 * @param  {object} opts
 * @return {object} reqOpts
 */
module.exports = function(meta, mode, id, entity, opts) {
	if(!id || typeof id !== 'string') {
		throw new Error('id as string required')
	}

	if(typeof entity === 'object') {
		opts = entity
		entity = meta.entity
	} else if(typeof entity !== 'string') { // could be cb
		entity = meta.entity
	}

	if(typeof opts !== 'object') {
		opts = {}
	}

	switch(mode[0]) {
		case 'mentions':
			var acceptHeader = 'application/vnd.tent.post-mentions.v0+json'
		break
		case 'versions':
			var acceptHeader = 'application/vnd.tent.post-versions.v0+json'
		break
		case 'childVersions':
			var acceptHeader = 'application/vnd.tent.post-children.v0+json'
		break
		default:
			var acceptHeader = 'application/vnd.tent.post.v0+json'
	}

	var method = (mode[1] === 'count') ? 'HEAD' : 'GET'

	var query = {}

	if(opts.version)
		query.version = opts.version
	if(opts.profiles)
		query.profiles = utils.setProfiles(opts.profiles)

	var url = meta.servers[0].urls.post
	
	var qs = querystring.stringify(query)
	//qs = qs.replace(/%2C/g, ',')
	//qs = qs.replace(/%2B/g, '+')
	if(qs) url += '?' + qs

	var encEntity = encodeURIComponent(entity)
	var encID = encodeURIComponent(id)

	var reqOpts = {
		url: url.replace('{entity}', encEntity).replace('{post}', encID),
		method: method,
		headers: {
			'Accept': acceptHeader
		}
	}

	debug('', reqOpts)

	return reqOpts
}