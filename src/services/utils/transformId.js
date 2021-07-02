const {
    replaceAll,
    removeAllSpecialChars,
} = require('./replaceAll');

/**
 * generate and transform ID and folderName
 * 
 * @param {'cat'|'scene'|'step'} type - cat, scene or step 
 * @param {number} id - id as an integer
 * @param {string} title - title to be transpfrmed
 * 
 * @returns {string} e.g. "cat01-hello-world"
 */
function transformId(type, id, title){
    title = removeAllSpecialChars(title);
    /**
     * @transform generate and transform ID and folderName
     */
    const transformedId = `${type}${id < 10 ? '0'+id : id}`;
    const transformedTitle = title.trim().toLowerCase().split(' ').join('-');
    return `${transformedId}-${transformedTitle}`;
}

module.exports = transformId;
