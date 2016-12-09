'use strict';
const ts = require("typescript");

class TsMockInterfaceGenerator {

    constructor() {
        this._modules = {
            node: null,
            modules: [],
            interfaces: []
        };
    }

    add(content) {
        ts.createSourceFile('', content.toString(), ts.ScriptTarget.ES6, true)
            .getChildren()
            .forEach(node => this._addNestedInterfaces(node, this._modules));
    }

    _addNestedInterfaces(node, module) {
        if (node.kind === ts.SyntaxKind.InterfaceDeclaration) {
            module.interfaces.push(node);
        }
        else if (node.kind === ts.SyntaxKind.ModuleDeclaration) {
            var nestedModule = module.modules.find(x => x.node.name.text === node.name.text);
            if(!nestedModule) {
                nestedModule = {
                    node: node,
                    modules: [],
                    interfaces: []
                };
                module.modules.push(nestedModule);
            }
            node.getChildren().forEach(n => this._addNestedInterfaces(n, nestedModule));
        }
        else if (node.kind === ts.SyntaxKind.SyntaxList || node.kind === ts.SyntaxKind.ModuleBlock) {
            node.getChildren().forEach(n => this._addNestedInterfaces(n, module));
        }
    }

    _generateOutput(module) {
        var output = [];

        module.interfaces.forEach(interfaceNode => {
            var properties = interfaceNode.members
                .filter(x => x.kind === ts.SyntaxKind.PropertySignature || x.kind === ts.SyntaxKind.PropertyDeclaration)
                .map((member) => `${member.name.text} = ${TsMockInterfaceGenerator.generateValueFromInterfaceMember(member)};`);

            output.push(`class ${interfaceNode.name.text} { ${properties.join(' ')} }`);
        });

        module.modules.forEach(childModule => {
            output.push(`module ${childModule.node.name.text} { ${this._generateOutput(childModule).map(x => 'export ' + x).join(' ')} }`);
        });

        return output;
    }

    generate() {
        return this._generateOutput(this._modules).join('\n');
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
