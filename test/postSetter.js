var test = require('tape')

var request = require('..')
var config = require('./config.json')

var client = request.createClient(config.meta, config.auth)

test('postSetter.mentions', function(t) {
	var entityStr = client.create().mentions('http://enti.ty').destroy()
	t.deepEqual(entityStr.base.post.mentions, [{ entity: 'http://enti.ty' }],
		'setting entity mention as string')

	var idStr = client.create().mentions('postID').destroy()
	t.deepEqual(idStr.base.post.mentions, [{ post: 'postID' }],
		'setting id mention as string')

	var entityIdStr = client.create()
		.mentions('http://enti.ty postID').destroy()
	t.deepEqual(entityIdStr.base.post.mentions,
		[{ entity: 'http://enti.ty', post: 'postID'}],
		'setting mention to a specific id of another entity')

	var mentionObj = {
		entity: 'http://entity.net',
		post: 'postID',
		version: 'versionHash',
		type: 'type',
		public: true
	}
	var obj = client.create().mentions(mentionObj).destroy()
	t.deepEqual(obj.base.post.mentions, [mentionObj], 'setting object')

	var arr = client.create().mentions(['http://enti.ty idid', mentionObj]).destroy()
	t.deepEqual(arr.base.post.mentions,
		[{ entity: 'http://enti.ty', post: 'idid' }, mentionObj],
		'setting array')

	arr.mentions('https://another.entity')
	t.deepEqual(arr.base.post.mentions[2],
		{ entity: 'https://another.entity' },
		'multiple calls are adding mentions')

	t.end()
})

test('postSetter.licenses', function(t) {
	var string = client.create().licenses('http://licen.se').destroy()
	t.deepEqual(string.base.post.licenses, [{ url: 'http://licen.se'}],
		'setting string')

	var arr = client.create().licenses(['http://licen.se', 'https://licen.se'])
		.destroy()
	t.deepEqual(arr.base.post.licenses,
		[{ url: 'http://licen.se' }, { url: 'https://licen.se' }],
		'setting array of values')

	arr.licenses('http://another.one')
	t.deepEqual(arr.base.post.licenses[2], { url: 'http://another.one' },
		'multiple calls are adding licenses')

	t.end()
})

test('postSetter.type', function(t) {
	var type = client.create().type('http://ty.pe').destroy()
	t.equal(type.base.post.type, 'http://ty.pe', 'setting string')

	type.type('http://another.type')
	t.equal(type.base.post.type, 'http://another.type',
		'multiple calls are replacing type')

	t.end()
})

test('postSetter.content', function(t) {
	var post = client.create().content({ age: 28 }).destroy()
	t.deepEqual(post.base.post.content, { age: 28 }, 'setting whole post')

	post.content('name', 'marie')
	t.equal(post.base.post.content.name, 'marie', 'setting one value pair')

	var addressObj = { street: 'some street name', city: 'random city' }
	post.content('address', addressObj)
	t.equal(post.base.post.content.address, addressObj,
		'setting value pair with non-string value')

	post.content({ name: 'alice', gender: 'female' })
	t.equal(post.base.post.content.name, 'alice')
	t.equal(post.base.post.content.gender, 'female',
		'setting single obj overwrites existing and adds new values')

	t.deepEqual(post.base.post.content, {
		age: 28, name: 'alice', address: {
			street: 'some street name', city: 'random city'
		}, gender: 'female' },
		'muliple calls are adding values')

	t.end()
})

test('postSetter.permissions', function(t) {
	var public = client.create().permissions(false).destroy()
	t.notOk(public.base.post.permissions.public, 'set public to false')

	var entity = client.create().permissions('http://enti.ty').destroy()
	t.deepEqual(entity.base.post.permissions.entities, ['http://enti.ty'],
		'setting single entity')

	var group = client.create().permissions('groupID').destroy()
	t.deepEqual(group.base.post.permissions.groups, [{post: 'groupID'}],
		'setting group id')

	var arr = client.create().permissions(['https://entiiii.ty', 'gruuuhp'])
		.destroy()
	t.deepEqual(arr.base.post.permissions, {
			public: false,
			entities: ['https://entiiii.ty'],
			groups: [{ post: 'gruuuhp'}]
		}, 'setting array of entites and group ids')

	t.end()
})