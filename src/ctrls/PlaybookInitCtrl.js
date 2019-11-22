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
// const VIEWS = require('../constants/views.const');
// const TEMPLATE = VIEWS.TEMPLATE;
const Constants = require('../constants/index');
const debug = Constants.isDebug;


/**
 * @requires Models
 */
const QuestionChoiceModel = require('../models/menus/ChoiceModel');

/**
 * @requires Views - menus 
 */
const InitMenuView = require('../views/menus/InitMenuView');

/**
 * @requires Services 
 * !@param WordColorService - not used - color the words helper 
 * @param FileService - helper for nice cmd line file tools 
 * @param ExamplesService - helper for importing Examples  
 */
// const WordColorService = require('../services/prettyprinter/WordColourService');
const FileService = require('../services/utils/FilesService');
const ExamplesService = require('../services/ExamplesService');


/**
 * Playbook Init handler 
 * 
 * @api /playbook/init
 * @calledby router 
 *
 * @class PlaybookInitCtrl
 * @extends {Controller}
 */
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
    async createPlaybook(args){

        /**
         * @name step0(args) 
         * @description select the template from the `args`
         * @param args - arg[3] should be the template 
         * @todo REFACTOR 
         *  1. remove .getTemplate
         *  2. Load examples models from ExampleService 
         *  3. Load them into a Menu View 
         *  4. Display as List 
         *  5. On select:
         *  6. copy the PlaybookJs file contents to the pwd 
         *  7. Copy the example folder to the pwd 
         *  8. (no change) Slow print 
         */


        /**
         * @step 1. Get all templates 
         */ 
        let exampleModels;
        try{
            exampleModels = ExamplesService.findAllExamples();
            // console.log('exampleModels ---> ', exampleModels);
            // console.log('exampleModels ---> ', exampleModels[0].playbookFileModel.contents);
        }
        catch(err){
            console.log('💀 Sorry, I had problems finding the examples. ', chalk.red(err.message));
            if(debug) console.error(err);
            return;
        }

        /**
         * @step 2. Show Init Menu from Example View 
         */ 
        let chosenExampleModel, playbookName, playbookFolder;
        try{
            const choiceModels = exampleModels.map(exampleModel => {
                return new QuestionChoiceModel(false, exampleModel.name);
            })

            const menuView = new InitMenuView(choiceModels);
            const answers = await menuView.show();

            /**
             * @param {ExampleModel} chosenExampleModel - Chosen Example Model
             */
            chosenExampleModel = exampleModels.find(exampleModel=>{
                return exampleModel.name === answers.keyChosenExample;
            })

            /** 
             * @param {string} playbookName - name of the playbook 
             */
            playbookName = answers.keyPlaybookName+'.playbook.js';

            /** 
             * @param {string} playbookFolder - folder to install the playbook 
             */
            playbookFolder = path.resolve(process.cwd(), answers.keyPlaybookFolder);

        }
        catch(err){
            console.log('💀 Sorry, I had problems showing the menu. ', chalk.red(err.message));
            if(debug) console.error(err);
            return;
        }

        if(debug) console.log({playbookName, playbookFolder, 'chosenExampleModel.name': chosenExampleModel.name});

        

        /**
         * @step 3. Create PlaybookJs file 
         */ 
        let createdPlaybookFileModel; 
        try{
            createdPlaybookFileModel = FileService.createFile(playbookFolder, playbookName, chosenExampleModel.playbookFileModel.contents);
        }
        catch(err){
            console.log('💀 Sorry, I had problems creating the playbook.js file. ', chalk.red(err.message));
            if(debug) console.error(err);
            return; 
        }


        /**
         * @step 4. Copy Playbbok folder 
         */ 
        let createdPlaybookFolderModel, source, destination; 
        try{
            source = chosenExampleModel.docsFolderModel.path; 
            destination = path.join(playbookFolder, 'playbook');

            console.log(`Copying from: \n${chalk.blue(source)} \nto: \n${chalk.green(destination)}`);

            createdPlaybookFolderModel = FileService.copyFolder(source, destination);
        }
        catch(err){
            console.log(`💀 Sorry, I had problems copying the playbook folder from ${chalk.blue(source)} to ${chalk.green(destination)} . `, chalk.red(err.message));
            if(debug) console.error(err);
            return; 
        }

        
        return;

        /** 
         * !refactor 
         * **/
        const playbookTemplate = args.length > 3 && args[3] === '--hello' ? TEMPLATE.hello : TEMPLATE.react;

        /**
         * @name step1(playbook.js) - write playbook.js locally
         * @description from parent controller - wraps up the read file sync 
         */
        const playbookContent = this.getTemplate(playbookTemplate.path);

        // const outputFile = process.cwd() + '/hello.playbook.js';    
        
        // fs.writeFileSync(outputFile, playbookContent, {encoding:'utf8'});
        let fileModel; 
        try{
            fileModel = FileService.createFile(process.cwd(), 'hello.playbook.js', playbookContent);
        }catch(err){
            console.log('...aborting');
            return; 
        }

        console.log('🍎  Created a new file called: '+ chalk.green(fileModel.path) );

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