var test = require('tape')

var request = require('..')
var config = require('./config.json')

var client = request.createClient(config.meta, config.auth)

test('delete() constructor', function(t) {
	var id = client.delete('id').destroy()
	t.equal(id.base.id, 'id', 'only id required')
	t.notOk(id.base.callback)

	var idCb = client.delete('id', new Function).destroy()
	t.equal(idCb.base.id, 'id', 'id and callback')
	t.ok(idCb.base.callback)

	t.end()
})

test('delete.version', function(t) {
	var d = client.delete('id').version('vörsion').destroy()
	t.equal(d.base.versionQuery, 'vörsion', 'version set right')

	d.version('new version!')
	t.equal(d.base.versionQuery, 'new version!', 'version overwritten')

	t.end()
})

test('delete.createDeletePost', function(t) {
	var d = client.delete('id').version(false).destroy()
	t.notOk(d.base.createDeletePostHeader, 'value set')

	d.createDeletePost(true)
	t.ok(d.base.createDeletePostHeader, 'value overwritten')
	
	t.end()
})