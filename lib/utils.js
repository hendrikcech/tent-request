var urlMod = require('url')

var get = require('./get')
var query = require('./query')

//used by .query and .get
exports.setProfiles = function(profiles) {
	var query = ''

	if(!Array.isArray(profiles)) profiles = [profiles]

	if(profiles[0] === 'all')
		query = 'entity,refs,mentions,permissions,parents'
	else
		query = profiles.join()

	return query
}

exports.metadataSetter = { // TODO: implement version metadata
	publishedAt: function(time) {
		var error = 'publishedAt requires time as number'
		if(!time) throw new Error(error)

		time = Number(time)
		if(isNaN(time) || !time) throw new Error(error)

		return time
	},
	mentions: function(mentions) {
		var error = 'mentions requires an argument'
		if(!mentions) throw new Error(error)

		if(!Array.isArray(mentions)) mentions = [mentions]

		var res = mentions.map(function(mention) {
			
			if(typeof mention === 'string') {
				var entity = ''
				var id = ''

				mention = mention.split(' ')
				if(mention.length > 1) { // ('entity id')
					entity = mention[0]
					id = mention[1]
				} else { //('entity' || 'id')
					var p = urlMod.parse(mention[0])
					if(p.protocol === 'https:' || p.protocol === 'http:') //entity
						entity = mention[0]
					else //id
						id = mention[0]
				}

				mention = {}
				if(entity) mention.entity = entity
				if(id) mention.post = id				
			}

			//nothing to do, if user passed mentions object

			return mention
		})

		return res
	},
	licenses: function(arg) {
		var error = 'licenses requires a string or an array with strings'
		if(!arg) throw new Error(error)

		var licenses = []

		if(!Array.isArray(arg)) arg = [arg]

		arg.forEach(function(license) {
			licenses.push({ url: license })
		})

		return licenses
	},
	permissions: function(arg) {
		// arg boolean: set public / not public
		// arg string/array: public false, set entities and/or groups

		var error = 'permissions usage: boolean: set public / not public; string/array: public false, set entities and/or groups'

		if(typeof arg !== 'boolean' && !arg) throw new Error(error)

		var permissions = {}

		if(typeof arg === 'boolean') {
			permissions.public = arg
			return permissions
		}

		permissions.public = false

		if(typeof arg === 'string') arg = [arg]

		arg.forEach(function(id) {
			var parsed = urlMod.parse(id)

			// entity or group id?
			if(parsed.protocol === 'https:' || parsed.protocol === 'http:') {
				permissions.entities = permissions.entities || []
				permissions.entities.push(id)
			} else { // group id
				permissions.groups = permissions.groups || []
				permissions.groups.push({ post: id })
			}
		})

		return permissions
	},
	// just here so that lib/create and lib/update can decide if passed object
	// is content or metadata.
	attachments: function() {},
	versionMessage: function(val) {
		return val
	},
	versionPublishedAt: function(val) {
		return val
	}
}

exports.constructQuery = function(handle) {
	var client = this

	var queryFn = getQuery([])
	queryFn.count = getQuery(['count'])

	function getQuery(mode) {
		return function(queryObj, opts, cb) {
			var reqOpts = query(client.meta, mode, queryObj, opts)
			return handle(reqOpts, arguments[arguments.length - 1])
		}
	}

	return queryFn
}

exports.constructGet = function(handle) {
	var client = this

	var getFn = getGet([])
	getFn.versions = getGet(['versions'])
	getFn.versions.count = getGet(['versions', 'count'])
	getFn.childVersions = getGet(['childVersions'])
	getFn.childVersions.count = getGet(['childVersions', 'count'])

	function getGet(mode) {
		return function(id, entity, opts, cb) {
			var reqOpts = get(client.meta, mode, id, entity, opts)
			return handle(reqOpts, arguments[arguments.length - 1])
		}
	}

	return getFn
}