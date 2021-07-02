const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const glob = require('glob');


/**
 * @requires Controller - parent controller 
 */
const Controller = require('./Controller');

/**
 * @requires Services 
 * * ExamplesService 
 */
// const ExamplesService = require('../services/ExamplesService');
const PlaybookApiService = require('../services/PlaybookApiService');


class PlaybookBuildCtrl extends Controller{

    constructor(){
        super();
    }

    buildPlaybook(args){

        if(args.length >= 3){
            if(args[3] === 'usage') {
                console.log(`If you run ${chalk.magenta('playbook build')} it will look for all the ${chalk.green('*.playbook.js')} files`);  
            }
            else
            {
                global.playbook = require('../playbook.sdk').playbook;
                global.step = require('../playbook.sdk').step;
                PlaybookApiService.buildPlaybookJsonFromFolderPath(args[3] || './')
                console.log("All done");
                return;
            }
        }


        const playbookFiles = this.findAllPlaybooks();
        console.log('playbookFiles --->', playbookFiles);

        /**
         * @constant global.playbook 
         * @description required for playbooks to run. 
         */
        global.playbook = require('../playbook.sdk').playbook;
        
        playbookFiles.forEach(playbookJs => {
            /**
             * @name run! 
             * @description require and auto run the playbook which will write the json. This relies on `global.playbook` 
             * @requires global.playbook
             * ! this will write a file 
             */
            require(playbookJs.path);
        })

        /**
         * @description from parent controller - wraps up the read file sync 
         */
        // const playbookContent = fs.readFileSync(playbookTemplate, {encoding:'utf8'});

        // const outputFile = process.cwd() + '/hello.playbook.js';    
        // fs.writeFileSync(outputFile, playbookContent, {encoding:'utf8'});
    }
}

module.exports = new PlaybookBuildCtrl();