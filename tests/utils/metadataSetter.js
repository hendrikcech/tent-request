var test = require('tape')
var config = require('../config')
var setter = require('../../lib/utils').metadataSetter

var pA = setter.publishedAt

test('publishedAt() throws', function(t) {
	t.throws(pA)
	t.end()
})
test('publishedAt(String) throws', function(t) {
	t.throws(pA.bind(pA, 'randomthing'))
	t.end()
})
test('publishedAt(123456789)', function(t) {
	t.equal(pA(123456789), 123456789)
	t.end()
})

var m = setter.mentions

var entity = 'https://some.entity/'
var id = 'kdfl234'

test('mentions() throws', function(t) {
	t.throws(m)
	t.end()
})
test('mentions(entity)', function(t) {
	t.deepEqual(m(entity), [{ entity: entity }])
	t.end()
})
test('mentions(id)', function(t) {
	t.deepEqual(m(id), [{ post:id }])
	t.end()
})
test('mentions(entity id)', function(t) {
	t.deepEqual(m(entity + ' ' + id), [{ entity: entity, post: id }])
	t.end()
})
test('mentions([entity, id, entity])', function(t) {
	t.deepEqual(m([entity, id, entity + ' ' + id]),
		[{ entity: entity }, { post: id }, { entity: entity, post: id }])
	t.end()
})

var l = setter.licenses
var license = 'http://some.license/'

test('licenses() throws', function(t) {
	t.throws(l)
	t.end()
})
test('licenses(String)', function(t) {
	t.deepEqual(l(license), [{ url: license }])
	t.end()
})
test('licenses(Array) throws', function(t) {
	t.deepEqual(l([license, license]), [{ url: license }, { url: license }])
	t.end()
})


test('attachments() is there', function(t) {
	t.ok(setter.attachments)
	t.end()
})


var p = setter.permissions
var groupId = '713ksd'

test('permissions() throws', function(t) {
	t.throws(p)
	t.end()
})
test('permissions(Boolean)', function(t) {
	t.deepEqual(p(true), { public: true })
	t.end()
})
test('permissions(String entity)', function(t) {
	t.deepEqual(p(entity), {'public':false,'entities':['https://some.entity/']})
	t.end()
})
test('permissions(String groupId)', function(t) {
	t.deepEqual(p(groupId), {'public':false,'groups':[{'post':'713ksd'}]})
	t.end()
})
test('permissions(Array entity groupId mixed)', function(t) {
	t.deepEqual(p([entity, groupId, entity]),
		{'public':false,
		'entities':['https://some.entity/','https://some.entity/'],
		'groups':[{'post':'713ksd'}]}
	)
	t.end()
})