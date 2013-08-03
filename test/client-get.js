var test = require('tape')

var request = require('..')
var config = require('./config.json')

var client = request.createClient(config.meta, config.auth)

test('get() constructor', function(t) {
	var id = client.get('id').destroy()
	t.equal(id.base.id, 'id', 'only id required')
	t.equal(id.base.entity, config.meta.entity)
	t.notOk(id.base.callback)

	var idEntity = client.get('id', 'entity').destroy()
	t.equal(idEntity.base.id, 'id', 'id and entity')
	t.equal(idEntity.base.entity, 'entity')
	t.notOk(idEntity.base.callback)

	var idCb = client.get('id', new Function).destroy()
	t.equal(idCb.base.id, 'id', 'id and callback')
	t.equal(idCb.base.entity, config.meta.entity)
	t.ok(idCb.base.callback)

	var idEntityCb = client.get('id', 'entity', new Function).destroy()
	t.equal(idEntityCb.base.id, 'id', 'id, entity and callback')
	t.equal(idEntityCb.base.entity, 'entity')
	t.ok(idEntityCb.base.callback)

	t.end()
})

test('client.mentions .versions .childVersions', function(t) {
	[
		{ key: 'mentions',
			header: 'application/vnd.tent.post-mentions.v0+json' },
		{ key: 'versions',
			header: 'application/vnd.tent.post-versions.v0+json' },
		{ key: 'childVersions',
			header: 'application/vnd.tent.post-children.v0+json' }
	].forEach(function(fn) {
		var get = client.get('id')[fn.key]().destroy()
		t.equal(get.base.acceptHeader, fn.header,
			'set accept header for .' + fn.key)
	})

	var cV = client.get('id').childVersions('version').destroy()
	t.equal(cV.base.version, 'version', 'set version on .childVersions')

	cV.childVersions('new Version!')
	t.equal(cV.base.version, 'new Version!', 'replace version')

	t.end()
})


test('client..delete', function(t) {
	var req = client.get('id').count().destroy()
	t.equal(req.base.method, 'HEAD', '.count works')

	t.end()
})
