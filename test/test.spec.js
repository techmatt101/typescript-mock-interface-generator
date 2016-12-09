const assert = require('assert');
const fs = require('fs');
const ts = require('typescript');
const TsMockInterfaceGenerator = require('../src/index');

describe('Tests', () => {
    it('interface', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A {  }');
        assert.equal(subject.generate(), "class A {  }");
    });

    it('type string', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A { test: string; }');
        assert.equal(subject.generate(), "class A { test = ''; }");
    });

    it('type number', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A { test: number; }');
        assert.equal(subject.generate(), "class A { test = 0; }");
    });

    it('type boolean', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A { test: boolean; }');
        assert.equal(subject.generate(), "class A { test = false; }");
    });

    it('type array', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A { test: []; }');
        assert.equal(subject.generate(), "class A { test = []; }");
    });

    it('type tuple', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A { test: [string, number]; }');
        assert.equal(subject.generate(), "class A { test = []; }");
    });

    it('type void', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A { test: void; }');
        assert.equal(subject.generate(), "class A { test = undefined; }");
    });

    it('type undefined', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A { test: undefined; }');
        assert.equal(subject.generate(), "class A { test = undefined; }");
    });

    it('type function', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A { test: () => void; }');
        assert.equal(subject.generate(), "class A { test = function () {}; }");
    });


    it('type method', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A { a(test: string); }');
        assert.equal(subject.generate(), 'class A { a(test: string) {} }');
    });

    it('type method with return', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add('interface A { test(name: string): number; }');
        assert.equal(subject.generate(), "class A { test(name: string) { return 0; } }");
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

    it('complies without errors', () => {
        var subject = new TsMockInterfaceGenerator();
        subject.add(fs.readFileSync('test/input.ts'));
        fs.writeFileSync('test/output.ts', subject.generate());

        var tsProgram = ts.createProgram(['test/input.ts', 'test/output.ts'], {});
        var diagnostics = ts.getPreEmitDiagnostics(tsProgram);

        assert.ok(diagnostics.length === 0, JSON.stringify(diagnostics))
    });
});