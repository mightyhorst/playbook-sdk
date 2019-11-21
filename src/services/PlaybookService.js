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

class PlaybookService{

    constructor(){
        
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

module.exports = new PlaybookService();