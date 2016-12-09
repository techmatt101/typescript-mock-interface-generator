const assert = require('assert');
const TsMockInterfaceGenerator = require('../src/index');

describe('Tests', () => {
    it('interface', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A {}');
        assert.equal(subject.generate(), 'class A {  }');
    });
});