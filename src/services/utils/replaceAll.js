/**
 * 
 * @param {string} text - entire text to look for
 * @param {string} find - string to find or leave empty to remove spaces
 * @param {string?} replace - replace with string or leave empty to remove
 * @returns {string} e.g. replaceAll("hello there") -> "hello-there"
 */
function replaceAll(text, find, replace){

    find = find || ' ';
    replace = replace || '';

    return text.split(find).join(replace);
}

/**
 * Remove all special chars like ! # $ %
 * @param {string} text - full string to repalce all characaters from
 * @returns {string} transformedText - e.g. "Hello!#$%^" -> "Hello"
 */
function removeAllSpecialChars(text){
    text = replaceAll(text, '$');
    text = replaceAll(text, '@');
    text = replaceAll(text, '!');
    text = replaceAll(text, '#');
    // text = replaceAll(text, '.');
    text = replaceAll(text, '&');
    text = replaceAll(text, '%');
    text = replaceAll(text, '^');
    text = replaceAll(text, '*');
    text = replaceAll(text, '(');
    text = replaceAll(text, ')');
    text = replaceAll(text, `"`);
    text = replaceAll(text, `'`);
    text = replaceAll(text, "`");
    // text = replaceAll(text, `-`);
    // text = replaceAll(text, `_`);
    text = replaceAll(text, `+`);
    text = replaceAll(text, `=`);
    text = replaceAll(text, `{`);
    text = replaceAll(text, `}`);
    text = replaceAll(text, `|`);
    text = replaceAll(text, '\\');
    text = replaceAll(text, `[`);
    text = replaceAll(text, `]`);
    return text;
}
module.exports = {
    replaceAll,
    removeAllSpecialChars,
};
