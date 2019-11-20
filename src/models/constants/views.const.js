const path = require('path');

const TEMPLATE = {
    default: path.resolve(__dirname, '../../views/templates/hello.playbook.js'),
    hello: path.resolve(__dirname, '../../views/templates/hello.playbook.js'),
    react: path.resolve(__dirname, '../../views/templates/example.react.playbook.js'),
}

module.exports = {
    TEMPLATE
}