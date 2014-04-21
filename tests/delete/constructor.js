var test = require('tape')
var config = require('../config')
var del = require('../../lib/delete')

var meta = config.meta
var id = 'abc321'
var opts = { version: 'rndVer', createDeletePost: false }

test('del() throws', function(t) {
	t.throws(del.bind(del, meta))
	t.end()
})

test('id', function(t) {
	var req = del(meta, id)
	t.ok(req.url.indexOf(id) > -1, 'id set')
	t.end()
})

test('opts: version and createDeletePost', function(t) {
	var req = del(meta, id, opts)
	t.ok(req.url.indexOf('version='+opts.version) > -1, 'version set')
	t.equal(req.headers['Create-Delete-Post'], false, 'createDeletePost')
	t.end()
})