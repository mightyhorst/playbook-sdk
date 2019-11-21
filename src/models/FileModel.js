const fs = require('fs');
const path = require('path');

/**
 * IFile represents the path and the contents of a file 
 *
 * @class FileModel
 */
class FileModel{

    /**
     * Creates an instance of FileModel.
     * 
     * @param {string} path - path to the file
     * @param {string} contents - contents of the file 
     * @memberof IFile
     */
    constructor(path, contents){
        this.path = path;

        this.contents = contents || this.get();
    }

    /**
     * Read the file 
     *
     * @returns
     * @memberof FileModel
     */
    get(){
        this.contents = fs.readFileSync(this.path, {encoding: 'utf8'});
        return this.contents;
    }

    /**
     * Write the file 
     *
     * @param {string} contents
     * @returns
     * @memberof FileModel
     */
    put(contents){
        try{
            fs.writeFileSync(this.path, contents, {encoding:'utf8'});
            this.contents = contents;
            return true;
        }
        catch(err){
            return false; 
        }
    }
}
module.exports = FileModel;