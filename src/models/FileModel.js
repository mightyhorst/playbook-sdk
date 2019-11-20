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
     * @param {*} path
     * @param {*} contents
     * @memberof IFile
     */
    constructor(path, contents){
        this.path = path;

        this.contents = contents || this.get();
    }

    get(){
        this.contents = fs.readFileSync(this.path, {encoding: 'utf8'});
        return this.contents;
    }

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