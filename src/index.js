'use strict';
const ts = require('typescript');

class TsMockInterfaceGenerator {

    constructor() {
        this._modules = {
            node: null,
            modules: [],
            interfaces: []
        };
    }

    add(content) {
        ts.createSourceFile('', content.toString(), ts.ScriptTarget.Latest, true)
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
                .filter(x => x.kind === ts.SyntaxKind.PropertySignature || x.kind === ts.SyntaxKind.PropertyDeclaration || x.kind === ts.SyntaxKind.MethodSignature)
                .map((member) => TsBuilder.generateMember(member));

            output.push(`class ${interfaceNode.name.text} { ${properties.join(' ')} }`);
        });

        module.modules.forEach(childModule => {
            output.push(`module ${childModule.node.name.text} { ${this._generateOutput(childModule).map(x => 'export ' + x).join(' ')} }`);
        });

        return output;
    }

    generate(options) {
        var output = this._generateOutput(this._modules);

        if(options && options.exportOutput) {
            output = output.map(x => 'export ' + x);
        }

        return output.join('\n');
    }
}

class TsBuilder {
    static generateMember(member) {
        if (member.kind === ts.SyntaxKind.MethodSignature) {
            return `${member.name.text}${TsBuilder.generateMethod(member)}`;
        }

        if (member.type) {
            return `${member.name.text} = ${TsBuilder.generateValue(member.type)};`;
        }

        return `${member.name.text} = null;`;
    }

    static generateMethod(method) {
        return `(${method.parameters.map(x => x.getText()).join(', ')}) {${(method.type && method.type.kind !== ts.SyntaxKind.VoidKeyword) ? ` return ${TsBuilder.generateValue(method.type)}; ` : ''}}`;
    }

    static generateValue(type) {
        switch (type.kind) {
            case ts.SyntaxKind.StringKeyword:
                return "''";

            case ts.SyntaxKind.NumberKeyword:
                return '0';

            case ts.SyntaxKind.BooleanKeyword:
                return 'false';

            case ts.SyntaxKind.TupleType:
            case ts.SyntaxKind.ArrayType:
                return '[]';

            case ts.SyntaxKind.FunctionType:
                return `function ${TsBuilder.generateMethod(type)}`;

            case ts.SyntaxKind.VoidKeyword:
            case ts.SyntaxKind.UndefinedKeyword:
                return 'undefined';
        }

        return 'null as ' + type.getText();
    }
}

module.exports = TsMockInterfaceGenerator;
