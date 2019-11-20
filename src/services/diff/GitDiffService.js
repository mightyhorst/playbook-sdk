var gitDiff = require('git-diff')
var oldStr = 'fred\nis\nfunny\n'
var newStr = 'paul\nis\nfunny\n'
var diff = gitDiff(oldStr, newStr)

var assert = require('assert')
console.log('diff', {diff});
assert.equal(diff, '@@ -1,3 +1,3 @@\n-fred\n+paul\n is\n funny\n')
