const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const TEMPLATE = {
    default: path.resolve(__dirname, '../views/templates/hello.playbook.js'),
    hello: path.resolve(__dirname, '../views/templates/hello.playbook.js'),
}

module.exports = {

    createPlaybook: (args)=>{

        const playbookTemplate = args.length > 3 && args[3] === '--hello' ? TEMPLATE.hello : TEMPLATE.default;

        const playbookContent = fs.readFileSync(playbookTemplate, {encoding:'utf8'});

        const outputFile = process.cwd() + '/hello.playbook.js';    
        fs.writeFileSync(outputFile, playbookContent, {encoding:'utf8'});

        console.log('🍎  Created a new file called: '+ chalk.green(outputFile)+'\n\n');
        console.log( chalk.bold.grey(playbookContent) );
        console.log(' \n\n') ;
        console.log('🍎  You will need to install playbook sdk to use this by running: '+chalk.magenta('npm i -D masterclass-playbook')+'\n\n');

    }

}