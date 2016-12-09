'use strict';
const ts = require("typescript");

class TsMockInterfaceGenerator {

    constructor() {
        this._interfaces = [];
    }

    add(content) {
        ts.createSourceFile('', content.toString(), ts.ScriptTarget.ES6, true)
            .getChildren()
            .forEach(node => this._addNestedInterfaces(node));
    }

    _addNestedInterfaces(node) {
        if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
            this._interfaces.push(node);
        }
        else if (node.kind === ts.SyntaxKind.SyntaxList) {
            node.getChildren().forEach(n => this._addNestedInterfaces(n));
        }
    }

    generate() {
        return this._interfaces.map(interfaceNode => {
            var properties = interfaceNode.members
                .filter(x => x.kind === ts.SyntaxKind.PropertySignature || x.kind === ts.SyntaxKind.PropertyDeclaration)
                .map((member) => `${member.name.text} = ${TsMockInterfaceGenerator.generateValueFromInterfaceMember(member)};`);

            return `class ${interfaceNode.name.text} { ${properties.join(' ')} }`;
        })
        .join('\n');
    }

    static generateValueFromInterfaceMember(member) {
        if (member.kind === ts.SyntaxKind.MethodSignature) {
            return 'new Function()';
        }

        if (member.type) {
            switch (member.type.kind) {
                case ts.SyntaxKind.StringKeyword:
                    return 'new String()';

                case ts.SyntaxKind.NumberKeyword:
                    return 'new Number()';

                case ts.SyntaxKind.BooleanKeyword:
                    return 'new Boolean()';

                case ts.SyntaxKind.TupleType:
                case ts.SyntaxKind.ArrayType:
                    return 'new Array()';

                case ts.SyntaxKind.FunctionType:
                case ts.SyntaxKind.VoidKeyword:
                    return 'new Function()';
            }
        }

        return null;
    }
}

module.exports = TsMockInterfaceGenerator;
