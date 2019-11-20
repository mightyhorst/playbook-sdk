const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
var term = require( 'terminal-kit' ).terminal ;

/**
 * @requires Constants - view constants 
 */
const VIEWS = require('../models/constants/views.const');
const TEMPLATE = VIEWS.TEMPLATE;

/*const TEMPLATE = {
    default: path.resolve(__dirname, '../views/templates/hello.playbook.js'),
    hello: path.resolve(__dirname, '../views/templates/hello.playbook.js'),
    react: path.resolve(__dirname, '../views/templates/hello.playbook.js'),
}*/

/**
 * @requires Controller - parent controller 
 */
const Controller = require('./controller');

/**
 * @requires WordColor - color the words helper 
 */
const WordColorService = require('../services/prettyprinter/WordColourService');






class PlaybookInitCtrl extends Controller{

    constructor(){
        super();
    }

    createPlaybook(args){

        const playbookTemplate = args.length > 3 && args[3] === '--hello' ? TEMPLATE.hello : TEMPLATE.react;

        /**
         * @description from parent controller - wraps up the read file sync 
         */
        // const playbookContent = fs.readFileSync(playbookTemplate, {encoding:'utf8'});
        const playbookContent = this.getTemplate(playbookTemplate);

        const outputFile = process.cwd() + '/hello.playbook.js';    
        fs.writeFileSync(outputFile, playbookContent, {encoding:'utf8'});

        console.log('🍎  Created a new file called: '+ chalk.green(outputFile) );

        /*const colouredWords = WordColorService.bulkWordColor(playbookContent); 
        colouredWords.forEach(colouredWord => {
            const colourise = chalk[colouredWord.colour].bgBlack;
            process.stdout.write(colourise(colouredWord.word)+ ' ');
        })*/

        var cardinal = require('cardinal')
        var hideSemicolonsTheme = require('cardinal/themes/hide-semicolons')
        
        // console.log( chalk.bgBlack.greenBright(playbookContent) );
        console.log('🍎  You will need to install playbook sdk to use this by running: '+chalk.magenta('npm i -D masterclass-playbook')+'\n\n');
        // console.log( chalk.bgBlack.italic.white('   hello.playbook.js   ') );

        const printerContent = cardinal.highlightFileSync(outputFile, {theme: hideSemicolonsTheme});

        var slowTyper = this.typeWriter(printerContent);
        slowTyper.start();

        /*
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
        */
    }

}

module.exports = new PlaybookInitCtrl();