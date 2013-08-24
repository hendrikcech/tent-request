var test = require('tape')

var request = require('..')
var config = require('./config.json')

var client = request.createClient(config.meta, config.auth)

test('query() constructor', function(t) {
	var optsObj = { count: true }

	client.query().destroy()
	t.pass('no arguments required')

	t.test('only opts', function(st) {
		var opts = client.query(optsObj).destroy()
		st.equal(opts.base.opts, optsObj)
		st.end()
	})

	t.test('only callback', function(st) {
		var cb = client.query(new Function).destroy()
		st.equal(typeof cb.base.callback, 'function')
		st.end()
	})

	t.test('opts and callback', function(st) {
		var optsCb = client.query(optsObj, new Function).destroy()
		st.equal(optsCb.base.opts, optsObj)
		st.equal(typeof optsCb.base.callback, 'function')
		st.end()
	})

	t.end()
})

test('query.limit .since .until .before', function(t) {
	['limit', 'since', 'until', 'before'].forEach(function(key) {
		var q = client.query()[key]('param').destroy()

		t.deepEqual(q.base.query[key], 'param', '.' + key + ' arg set')

		q[key]('nuuuu')
		t.deepEqual(q.base.query[key], 'nuuuu',
			'repeated call of .' + key + ' overwrites value')
	})

	t.end()
})

test('query.sortBy', function(t) {
	var sortBy = client.query().sortBy('param').destroy()

	t.deepEqual(sortBy.base.query.sort_by, 'param', '.sortBy arg set')

	sortBy.sortBy('published_at')
	t.deepEqual(sortBy.base.query.sort_by, 'published_at',
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
			'.' + key + ' set multiple')

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

test('query.count (sub function)', function(t) {
	var count = client.query.count().destroy()
	t.equal(count.base.method, 'HEAD', 'works')
	t.end()
})

test('query: profiles', function(t) {
	var str = client.query({ profiles: 'entity' }).destroy()
	t.equal(str.base.query.profiles, 'entity', 'string')

	var arr = client.query({ profiles: ['refs', 'mentions']}).destroy()
	t.equal(arr.base.query.profiles, 'refs,mentions', 'array')

	var allStr = client.query({ profiles: 'all' }).destroy()
	t.equal(allStr.base.query.profiles,
		'entity,refs,mentions,permissions,parents', "'all' value as string")

	var allArr = client.query({ profiles: ['all'] }).destroy()
	t.equal(allArr.base.query.profiles,
		'entity,refs,mentions,permissions,parents', "'all' value as string")

	t.end()
})

test('query: maxRefs', function(t) {
	var maxRefs = client.query({ maxRefs: 5 }).destroy()

	t.deepEqual(maxRefs.base.query.max_refs, 5, '.maxRefs arg set')

	t.end()
})