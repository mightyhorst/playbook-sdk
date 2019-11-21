const path = require('path');

const TEMPLATE = {
    default: {
        fileName: 'hello.playbook.js',
        path: path.resolve(__dirname, '../../views/templates/hello.playbook.js'),
        folderToCopy: false
    },
    hello: {
        fileName: 'hello.playbook.js',
        path: path.resolve(__dirname, '../../views/templates/hello.playbook.js'),
        folderToCopy: false
    },
    react: {
        fileName: 'hello.playbook.js',
        path: path.resolve(__dirname, '../../views/templates/example.react.playbook.js'),
        folderToCopy: false
    },
    simple: {
        fileName: 'hello.playbook.js',
        path: path.resolve(__dirname, '../../views/templates/examples/00_simple/example.simple.playbook.js'),
        folderToCopy: false
    },
}

module.exports = {
    TEMPLATE
}