# Typescript  Mock Interface Generator
Generates mock objects from typescript interfaces.

## Examples

### Usage Example
```js
const TsMockInterfaceGenerator = require('typescript-mock-interface-generator');

var interfaceGenerator = new TsMockInterfaceGenerator();
interfaceGenerator.add('interface Example {...}');
var output = interfaceGenerator.generate(); // "class Example {...}"
```

### Example Input
```js
interface IDog {
    name: string;
    age: number;
    bark();
}
```

### Example Output Generated
```js
class IDog {
    name = new String();    // ""
    age = new Number();     // 0
    bark = new Function();  // function(){}
}
```
