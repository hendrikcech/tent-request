var test = require('tape')

var request = require('..')
var config = require('./config.json')

var client = request.createClient(config.meta, config.auth)

test('query() constructor', function(t) {
	client.query().destroy()
	t.pass('no arguments required')

	var cb = client.query(new Function).destroy()
	t.ok(cb.base.callback, 'accepts callback')

	t.end()
})

test('query.limit .since .until .before .sortBy', function(t) {
	['limit', 'since', 'until', 'before'].forEach(function(key) {
		var q = client.query()[key]('param').destroy()

		t.deepEqual(q.base.query[key], 'param', '.' + key + ' arg set')

		q[key]('nuuuu')
		t.deepEqual(q.base.query[key], 'nuuuu',
			'repeated call of .' + key + ' overwrites value')
	})

	var sortBy = client.query().sortBy('param').destroy()

	t.deepEqual(sortBy.base.query.sort_by, 'param', '.sortBy arg set')

	sortBy.sortBy('nuuuu')
	t.deepEqual(sortBy.base.query.sort_by, 'nuuuu',
		'repeated call of .sortBy overwrites value')

	t.end()
})

test('query.types .entities', function(t) {
	['types', 'entities'].forEach(function(key) {
		var str = client.query()[key]('http://argu.ment').destroy()
		t.deepEqual(str.base.query[key], 'http://argu.ment',
			'.' + key + ' set string')

		var arr = client.query()
			[key](['http://argu.ment', 'https://another.one']).destroy()
		t.deepEqual(arr.base.query[key], 'http://argu.ment,https://another.one',
			'.' + key + ' set mulitple')

		arr[key]('http://moaaaaa.rr')
		t.deepEqual(arr.base.query[key],
			'http://argu.ment,https://another.one,http://moaaaaa.rr',
			'multiple .' + key + ' calls dont overwrite')
	})
	
	t.end()
})

test('query.mentions', function(t) {
	var single = client.query().mentions('http://entit.ty').destroy()
	t.deepEqual(single.base.query.mentions, ['http://entit.ty'], 'single entity')

	var and = client.query()
		.mentions(['http://enti.ty', 'https://enti.ty']).destroy()
	t.deepEqual(and.base.query.mentions, ['http://enti.ty,https://enti.ty'],
		'multiple (and)')

	var or = client.query()
		.mentions('http://enti.ty', 'https://enti.ty').destroy()
	t.deepEqual(or.base.query.mentions, ['http://enti.ty','https://enti.ty'],
		'or')

	var and2 = client.query()
		.mentions(['http://enti.ty', 'https://enti.ty'], 'http://OOOOO.RRRR')
		.destroy()
	t.deepEqual(and2.base.query.mentions,
		['http://enti.ty,https://enti.ty', 'http://OOOOO.RRRR'],
		'multiple ands with or')

	t.end()
})

test('query.count', function(t) {
	var count = client.query().count().destroy()
	t.equal(count.base.method, 'HEAD', 'works')
	t.end()
})