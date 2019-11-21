const fs = require('fs');
const pathService = require('path');

/**
 * IFile represents the path and the contents of a file 
 * 
 * @var path - path to the file 
 * @var contents - contents of the file 
 * @var name - file name 
 * @var ext - file extension or type 
 *
 * @class FileModel
 */
class FileModel{

    /**
     * Creates an instance of FileModel.
     * 
     * @param {string} filePath - path to the file
     * @param {string} fileContents - contents of the file 
     * @memberof IFile
     */
    constructor(filePath, fileContents){
        this.path = filePath;
        this.name = pathService.basename(filePath);
        this.nameSansExt = pathService.parse(filePath).name;
        this.folder = pathService.dirname(filePath);
        this.ext = pathService.extname(filePath);
        this.contents = fileContents || this.read();
    }

    /**
     * Read the file 
     *
     * @returns
     * @memberof FileModel
     */
    read(){
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
    write(contents){
        try{
            fs.writeFileSync(this.path, contents, {encoding:'utf8'});
            this.contents = contents;
            return true;
        }
        catch(err){
            return false; 
        }
    }

    /**
     * @todo upload/save folder 
     *
     * @memberof FolderModel
     */
    save(){

    }
    upload(){
        this.save();
    }
    put(){
        this.upload();
    }
    /**
     * @todo sync with server 
     *
     * @memberof FolderModel
     */
    sync(){

    }
    download(){
        this.sync();
    }

    /**
     * @todo Destroys the file locally and optionally remotely
     *
     * @param {boolean} destroyOnMsStorage - destory on the MS storage server too 
     * @memberof FileModel
     */
    destroy(destroyOnMsStorage){
        destroyOnMsStorage = destroyOnMsStorage || false; 

    }
}
module.exports = FileModel;