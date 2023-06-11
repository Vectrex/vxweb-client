function parseDate(dateString, format) {

    let matches, escapedFormat = format.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), posMap = [];

    // check for single day, month and year expression

    if((matches = format.match(/\bd\b/gi)) && 1 === matches.length) {
        escapedFormat = escapedFormat.replace('d', '(\\d{1,2})');
    }
    else if((matches = format.match(/\bdd\b/gi)) && 1 === matches.length) {
        escapedFormat = escapedFormat.replace('dd', '(\\d{2})');
    }
    else {
        return false;
    }
    posMap.push( { srcPos: format.toLowerCase().indexOf('d'), destPos: 2 });

    if((matches = format.match(/\bm\b/gi)) && 1 === matches.length) {
        escapedFormat = escapedFormat.replace('m', '(\\d{1,2})');
    }
    else if((matches = format.match(/\bmm\b/gi)) && 1 === matches.length) {
        escapedFormat = escapedFormat.replace('mm', '(\\d{2})');
    }
    else {
        return false;
    }
    posMap.push( { srcPos: format.toLowerCase().indexOf('m'), destPos: 1 });

    if((matches = format.match(/\byyyy\b/gi)) && 1 === matches.length) {
        escapedFormat = escapedFormat.replace('yyyy', '(\\d{4})');
    }
    else {
        return false;
    }
    posMap.push( { srcPos: format.toLowerCase().indexOf('y'), destPos: 0 });
    if(!(matches = dateString.match(escapedFormat))) {
        return false;
    }

    // remove first match

    matches.shift();

    // bring day, month, year in correct order to allow ISO notation

    posMap.sort( (a, b) => a.srcPos < b.srcPos ? -1 : 1);

    let result = [], part, pos;

    while((part = matches.shift())) {
        pos = posMap.shift();
        result[pos.destPos] = part;
    }

    result = Date.parse(result.join('-'));

    if(!result) {
        return false;
    }
    result = new Date(result);
    return new Date(result.getFullYear(), result.getMonth(), result.getDate(), 0, 0, 0);
}

export { parseDate }