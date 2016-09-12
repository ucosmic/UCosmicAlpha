
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
ttw.replaceAll = function(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}