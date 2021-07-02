const path = require('path');

const {PLAYBOOK} = require('./playbook.const');

module.exports = {
    isDebug: true, 
    examplesFolder: path.resolve(__dirname, '../views/templates/examples'),
    PLAYBOOK,
}