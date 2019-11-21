const path = require('path');
const fs = require('fs');
const glob = require('glob');
const chalk = require('chalk');
var term = require( 'terminal-kit').terminal;

/**
 * @requires Services 
 */
const FileService = require('../services/utils/FilesService');

/**
 * @constant VIEWS 
 */
// const VIEWS = require('../models/constants/views.const');

/**
 * @requires Models 
 */
const Models = require('../models/index');
const FileModel = Models.FileModel;

class Controller{

    constructor(){
        
    }

    /**
     * Get view from the views folder 
     *
     * @param {string} playbookTemplate - path to the file 
     * @returns {string} playbookContent - contents of the file 
     * @memberof Controller
     */
    getView(playbookTemplate){
        const playbookContent = fs.readFileSync(playbookTemplate, {encoding:'utf8'});
        return playbookContent;
    }

    /**
     * Get Template via Constant
     *
     * @param {TEMPLATE} playbookTemplate - path to the file 
     * @returns {string} playbookContent - contents of the file 
     * @memberof Controller
     */
    getTemplate(playbookTemplate){
        return this.getView(playbookTemplate);
    }

    /**
     * Typewriter effect slow prints the contents as it emulates a developer typing the file out. 
     * This helps with reading at a nice pace like watching a video 
     *
     * @param {string} txt - Text contents to print out 
     * @param {number} speed - how fast in milliseconds for each character to be printed 
     * @returns {Function} start - start function to begin the process 
     * @memberof Controller
     */
    typeWriter(txt, speed){
        var i = 0;
        var txt = txt || 'Lorem ipsum dummy text blabla.';
        var speed = speed || 10;


        const start = () => {
            if (i < txt.length) {
                process.stdout.write( txt.charAt(i) );
                i++;
                setTimeout(start, speed);
            }            
        }

        return {
            start
        }
            
    }

    /**
     * Returns the file paths to all the *playbook.js files 
     * @returns {Array<IFile>} playbookFiles - array of paths to the playbook files and the contents 
     * @memberof Controller
     * @todo refactor to use FileService not glob directly 
     */
    findAllPlaybooks(){
        const fileModels =  FileService.findAllCwd('*.playbook.js');
        return fileModels;
    }
}

module.exports = Controller;