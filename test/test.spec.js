const assert = require('assert');
const TsMockInterfaceGenerator = require('../src/index');

describe('Tests', () => {
    it('interface', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A { test: string; }');
        assert.equal(subject.generate(), 'class A { test = new String(); }');
    });

    it('module', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('module A { interface A {} }');
        assert.equal(subject.generate(), 'module A { export class A {  } }');
    });

    it('export module', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('export module A { interface A {} }');
        assert.equal(subject.generate(), 'module A { export class A {  } }');
    });

    it('multiple modules', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('module A { interface A {} }');
        subject.add('module A { interface B {} }');
        assert.equal(subject.generate(), 'module A { export class A {  } export class B {  } }');
    });

    it('nested modules', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('module A { module B { interface A {} } }');
        assert.equal(subject.generate(), 'module A { export module B { export class A {  } } }');
    });

    it('export output', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A {}');
        assert.equal(subject.generate({ exportOutput: true }), 'export class A {  }');
    });
});