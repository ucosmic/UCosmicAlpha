
"use strict";
ucosmic.add_style = function(content, name){
    if(!ucosmic.tennant_styles_loaded){
        ucosmic.tennant_styles_loaded = [];
    }
    if(ucosmic.tennant_styles_loaded.indexOf(name) === -1){
        ucosmic.tennant_styles_loaded.push(name);
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = content;
        document.getElementsByTagName('head')[0].appendChild(style);
    }
}