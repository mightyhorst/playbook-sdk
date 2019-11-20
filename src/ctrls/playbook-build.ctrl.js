const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const glob = require('glob');


/**
 * @requires Controller - parent controller 
 */
const Controller = require('./controller');






class PlaybookBuildCtrl extends Controller{

    constructor(){
        super();
    }

    buildPlaybook(args){

        if(args.length >= 3){
            if(args[3] === 'usage') {
                console.log(`If you run ${chalk.magenta('playbook build')} it will look for all the ${chalk.green('*.playbook.js')} files`);  
            }
        }


        const playbookFiles = this.findAllPlaybooks();
        console.log('playbookFiles --->', playbookFiles);

        /**
         * @description from parent controller - wraps up the read file sync 
         */
        // const playbookContent = fs.readFileSync(playbookTemplate, {encoding:'utf8'});

        // const outputFile = process.cwd() + '/hello.playbook.js';    
        // fs.writeFileSync(outputFile, playbookContent, {encoding:'utf8'});
    }
}

module.exports = new PlaybookBuildCtrl();