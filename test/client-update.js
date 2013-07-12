var test = require('tape')

var request = require('..')
var config = require('./config.json')

var client = request.createClient(config.meta, config.auth)

var vObj = { post: 'postID', entity: 'entity', version: 'version' }

test('update() constructor', function(t) {
	var id = client.update('id').destroy()
	t.equal(id.base.id, 'id', 'only id required')
	
	var idCb = client.update('id', new Function).destroy()
	t.equal(idCb.base.id, 'id', 'id right')
	t.ok(idCb.base.callback, 'cb right')

	var idHash = client.update('id', 'vHash').destroy()
	t.equal(idHash.base.id, 'id', 'id right')
	t.equal(idHash.base.post.version.parents[0].version, 'vHash', 'vHash right')

	var all = client.update('id', 'vHash', new Function).destroy()
	t.equal(all.base.id, 'id', 'id right')
	t.equal(idHash.base.post.version.parents[0].version, 'vHash', 'vHash right')
	t.ok(idCb.base.callback, 'cb right')

	var obj = client.update('id', vObj).destroy()
	t.equal(all.base.id, 'id', 'id right')
	t.deepEqual(obj.base.post.version.parents[0], vObj, 'vObj right')

	t.end()
})

function up() {
	return client.update('id')
}

test('update.parents', function(t) {
	var string = up().parents('vHash').destroy()
	t.deepEqual(string.base.post.version.parents, [{ version: 'vHash' }],
		'passing string vHash')

	var obj = up().parents(vObj).destroy()
	t.deepEqual(obj.base.post.version.parents, [vObj], 'passing version object')

	var arr = up().parents(['vHash', vObj]).destroy()
	t.deepEqual(arr.base.post.version.parents, [{ version: 'vHash' }, vObj],
		'passing array of parents')

	arr.parents('newHash')
	t.deepEqual(arr.base.post.version.parents,
		[{ version: 'vHash' }, vObj, {"version":"newHash"}],
		'passing multiple parents adds these')

	t.end()
})

test('update.versionPublishedAt', function(t) {
	var pub = up().versionPublishedAt(123456789).destroy()
	t.deepEqual(pub.base.post.version.published_at, 123456789, 'works')

	pub.versionPublishedAt(987654321)
	t.deepEqual(pub.base.post.version.published_at, 987654321,
		'overwrites value')

	t.end()
})

test('update.versionMessage', function(t) {
	var pub = up().versionMessage('Hey, a message!').destroy()
	t.deepEqual(pub.base.post.version.message, 'Hey, a message!', 'works')

	pub.versionMessage('New message.')
	t.deepEqual(pub.base.post.version.message, 'New message.',
		'overwrites value')

	t.end()
})