
"use strict";
ucosmic.add_style = function(content, param){
    if(!ucosmic.styles_loaded){
        ucosmic.styles_loaded = [];
    }
    if(ucosmic.styles_loaded.indexOf(param) === -1){
        ucosmic.styles_loaded.push(param);
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = content;
        document.getElementsByTagName('head')[0].appendChild(style);
    }
}