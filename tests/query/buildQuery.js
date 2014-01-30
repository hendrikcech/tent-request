var test = require('tape')
var config = require('../config')
var query = require('../../lib/query').buildQuery

test('types', function(t) {
	t.deepEqual(query({ types: config.type }), { types: config.type }, 'string')
	t.deepEqual(query({ types: [config.type, config.type] }),
		{ types: config.type + ',' + config.type }, 'array')
	t.end()
})

var entity = 'https://enti.ty'

test('entities', function(t) {
	t.deepEqual(query({ entities: entity }), { entities: entity },
		'string')
	t.deepEqual(query({ entities: [entity, entity] }),
		{ entities: entity + ',' + entity }, 'array')
	t.end()
})

test('mentions', function(t) {
	t.deepEqual(query({ mentions: entity }),
		{ mentions: [entity] }, 'string')

	t.deepEqual(query({ mentions: [entity, entity] }),
		{ mentions: [entity, entity] }, 'OR')

	t.deepEqual(query({ mentions: [[entity, entity]] }),
		{ mentions: [entity + ',' + entity] }, 'AND')

	t.deepEqual(query({ mentions: [[entity, entity], entity] }),
		{ mentions: [entity + ',' + entity, entity] }, 'AND and or')

	t.end()
})

test('limit, sortBy, since, until, before', function(t) {
	t.deepEqual(query({ limit: 5 }), { limit: 5})
	t.deepEqual(query({ sortBy: 'published_at' }), { sortBy: 'published_at' })
	t.deepEqual(query({ since: 123456789 }), { since: 123456789 })
	t.deepEqual(query({ until: 987654321 }), { until: 987654321 })
	t.deepEqual(query({ before: 543216789 }), { before: 543216789 })

	t.end()
})