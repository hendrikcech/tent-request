var vows = require('vows')
var assert = require('assert')
var request = require('../request')
//var config = require('./config')

function testSetter(arg, expected) {
	var context = {
		topic: function(client) {
			var split = this.context.name.split(/ +/) // ['published_at', 'comment']
			var command = split[0] // '.published_at'
			command = command.substr(1)	// '.substr(1)'

			var post = client.newPost('http://post.type')
			post[command](arg)
			return post.print()
		}
	}
	context['valid'] = function(post) {
		expected.type = expected.type || 'http://post.type'
		assert.deepEqual(post, expected)
	}

	return context
}

vows.describe('newPost').addBatch({
	'.newClient': {
		topic: function() {
			var metaPart =  {
				"version": "0.3",
				"preference": 0,
				"urls": {
					"oauth_auth": "http://bb216a47d970.alpha.attic.is/oauth",
					"oauth_token": "http://bb216a47d970.alpha.attic.is/oauth/authorization",
					"posts_feed": "http://bb216a47d970.alpha.attic.is/posts",
					"post": "http://bb216a47d970.alpha.attic.is/posts/{entity}/{post}",
					"new_post": "http://bb216a47d970.alpha.attic.is/posts",
					"post_attachment": "http://bb216a47d970.alpha.attic.is/posts/{entity}/{post}/{version}/attachments/{name}",
					"attachment": "http://bb216a47d970.alpha.attic.is/attachments/{entity}/{digest}",
					"batch": "http://bb216a47d970.alpha.attic.is/batch",
					"server_info": "http://bb216a47d970.alpha.attic.is/server"
				}
			}
			var client = request.createClient(metaPart)
			return client
		},
		'newPost': {
			'.published_at': testSetter('123456789', { published_at: '123456789' }),
			'.mention single': testSetter('http://ment.ion', { mentions: ['http://ment.ion'] }),
			'.mention multiple': testSetter(['http://ment1.ion', 'ment2.ion'], { mentions: ['http://ment1.ion', 'ment2.ion'] }),
			'.license single': testSetter('http://licen.se', { licenses: [{ url: 'http://licen.se' }]}),
			'.license multiple': testSetter(['http://licen1.se', 'http://licen2.se'], { licenses: [{ url: 'http://licen1.se' }, { url: 'http://licen2.se'}]}),
			'.type': testSetter('https://ty.pe', { type: 'https://ty.pe' }),
			'.content': testSetter({ name: 'hi', 'who': { are: 'you?' }}, { content: { name: 'hi', 'who': { are: 'you?' }}}),
			'.permissions boolean': testSetter(false, { type: 'http://post.type', permissions: { public: false } }),
			'.permissions single entity': testSetter('https://enti.ty', { permissions: { public: false, entities: ['https://enti.ty'] }}),
			'.permissions single group': testSetter('groupID', { permissions: { public: false, groups: [{ post: 'groupID' }] }}),
			'.permissions multiple mixed': testSetter(['https://enti.ty', 'groupID', 'http://enti.ty'], {permissions: { public: false, entities: [ 'https://enti.ty', 'http://enti.ty' ], groups: [{ post: 'groupID' }] }})
		}
	}
}).export(module)

		// 'most': {
		// 	topic: function(client) {
		// 		var post = client.newPost('http://post.type')
		// 			.published_at('123456789')
		// 			.mention('mention1')
		// 			.mention(['mention2', 'mention3'])
		// 			.license('license1')
		// 			.license('license2', 'license3')
		// 			.type('https://post.type')
		// 			.content({ jo: 'content!', bla: { ya: 'know?' } })

		// 		return post.print()
		// 	},
		// 	valid: function(post) {
		// 		var expected = {
		// 			type: 'https://post.type',
  // 					published_at: '123456789',
  // 					mentions: [ 'mention1', 'mention2', 'mention3' ],
  // 					licenses: [ { url: 'license1' }, { url: 'license2' } ],
  // 					content: { jo: 'content!', bla: { ya: 'know?' } } 
  // 				}
		// 		assert.deepEqual(post, expected)
		// 	}
		// },

/*
.addBatch({
	'Check config file': {
		'config file loaded': function() {
			assert.isObject(config)
		},
		'all values set': function() {
			assert.isNotEmpty(config.server)
			assert.isNotEmpty(config.auth)
			assert.isNotEmpty(config.auth.mac_key)
			assert.isNotEmpty(config.auth.access_token)
		}
	}
})
*/