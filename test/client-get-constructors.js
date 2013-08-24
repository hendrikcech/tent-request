var test = require('tape')

var request = require('..')
var config = require('./config.json')

var client = request.createClient(config.meta, config.auth)

test('constructors', function(t) {
	var idArg = 'id'
	var entityArg = 'entity'
	var optsArg = { profiles: 'all' }

	function testIt(title, fn, subFn, id, entity, opts, callback) {
		var args = []
		if(id) args.push(idArg)
		if(entity) args.push(entityArg)
		if(opts) args.push(optsArg)
		if(callback) args.push(new Function)

		var getFn = client.get
		if(fn) getFn = getFn[fn]
		if(subFn) getFn = getFn[subFn]

		var name = 'get'
		if(fn) name += '.' + fn
		if(subFn) name += '.' + subFn
		name += ': ' + title

		t.test(name, function(st) {
			var req = getFn.apply(client, args).destroy()

			if(id) st.equal(req.base.id, idArg)
			else st.notOk(req.base.id)

			if(entity) st.equal(req.base.entity, entityArg)
			else st.equal(req.base.entity, config.meta.entity)

			if(opts) st.equal(req.base.opts, optsArg)
			else st.deepEqual(req.base.opts, {})

			if(callback) st.equal(typeof req.base.callback, 'function')
			else st.notOk(req.base.callback)

			st.end()
		})
	}

	function startTests(fn, subFn) {
		testIt('only id required', fn, subFn, true)
		testIt('id and entity', fn, subFn, true, true)
		testIt('id and opts', fn, subFn, true, false, true)
		testIt('id and callback', fn, subFn, true, false, false, true)
		testIt('id, entity and opts', fn, subFn, true, true, true)
		testIt('id, entity and callback', fn, subFn, true, true, false, true)
		testIt('id, opts and callback', fn, subFn, true, false, true, true)
		testIt('id, entity, opts and callback (all)', fn, subFn, true, true, true, true)
		testIt('id, entity, opts and callback (all)', fn, subFn, true, true, true, true)
	}

	['', 'mentions', 'versions', 'childVersions'].forEach(function(fn) {
		startTests(fn)
		if(fn) startTests(fn, 'count')
	})
	
	t.end()
})