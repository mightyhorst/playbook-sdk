const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
var term = require( 'terminal-kit' ).terminal;

/**
 * @requires Controller - parent controller 
 */
const Controller = require('./Controller');

/**
 * @requires Constants - view constants 
 */
const VIEWS = require('../models/constants/views.const');
const TEMPLATE = VIEWS.TEMPLATE;

/**
 * @requires Views - menus 
 */
const BuildMenuView = require('../views/menus/BuildMenuView');

/**
 * @requires Services 
 * @param WordColorService - color the words helper 
 * @param FileService - helper for nice cmd line file tools 
 */
const WordColorService = require('../services/prettyprinter/WordColourService');
const FileService = require('../services/utils/FilesService');






class PlaybookInitCtrl extends Controller{

    constructor(){
        super();
    }

    /**
     * @name createPlaybook
     * @description create playbook and copy the folder locally to the current working directory 
     * @param args - arg[3] should be the template 
     * @param {string} args[0] - 'playbook'
     * @param {string} args[1] - 'init'
     * @param {string} args[2] - '--templateName' 
     */
    createPlaybook(args){

        /**
         * @name step0(args) 
         * @description select the template from the `args`
         * @param args - arg[3] should be the template 
         */
        const playbookTemplate = args.length > 3 && args[3] === '--hello' ? TEMPLATE.hello : TEMPLATE.react;

        /**
         * @name step1(playbook.js) - write playbook.js locally
         * @description from parent controller - wraps up the read file sync 
         */
        const playbookContent = this.getTemplate(playbookTemplate.path);

        const outputFile = process.cwd() + '/hello.playbook.js';    
        fs.writeFileSync(outputFile, playbookContent, {encoding:'utf8'});

        console.log('🍎  Created a new file called: '+ chalk.green(outputFile) );

        /*const colouredWords = WordColorService.bulkWordColor(playbookContent); 
        colouredWords.forEach(colouredWord => {
            const colourise = chalk[colouredWord.colour].bgBlack;
            process.stdout.write(colourise(colouredWord.word)+ ' ');
        })*/

        /**
         * @name step3(typewriter) 
         * @description pretty print the hello.playbook.js to the console 
         * @todo add cancel key and visual info 
         */
        var cardinal = require('cardinal')
        var hideSemicolonsTheme = require('cardinal/themes/hide-semicolons')

        const printerContent = cardinal.highlightFileSync(outputFile, {theme: hideSemicolonsTheme});

        var slowTyper = this.typeWriter(printerContent);
        slowTyper.start();

        /** @alternative term.slowTyping
        term.slowTyping(
            printerContent,
            { 
                style: term.inverse.bold.greenBright, 
                flashStyle: term.bgBlack.brightWhite,
                delay: 20,
                flashDelay: 50,

            } ,
            function() { process.exit() ; }
        ) ;
        **/
    }

}

module.exports = new PlaybookInitCtrl();