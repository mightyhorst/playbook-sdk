const cardinal = require('cardinal');
// const cardinalTheme = require('cardinal/themes/hide-semicolons');
const cardinalTheme = require('cardinal/themes/tomorrow-night');

/**
 * Color the files 
 *
 * @class WordColourService
 */
class WordColourService{

    /**
     * Return the contents of a file colour coded 
     *
     * @param {string} filePath - path to the file you want to code colour 
     * @memberof WordColourService
     */
    codeColour(filePath){

        const printerContent = cardinal.highlightFileSync(filePath, {theme: cardinalTheme});
        return printerContent;

    }

}


module.exports = new WordColourService();