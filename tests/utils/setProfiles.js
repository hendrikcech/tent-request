var test = require('tape')
var utils = require('../../lib/utils')

test('setProfiles(single)', function(t) {
	t.equal(utils.setProfiles('entity'), 'entity')
	t.end()
})
test('setProfiles(multiple)', function(t) {
	t.equal(utils.setProfiles('entity,permissions'), 'entity,permissions')
	t.end()
})
test('setProfiles(all)', function(t) {
	t.equal(utils.setProfiles('all'), 'entity,refs,mentions,permissions,parents')
	t.end()
})
