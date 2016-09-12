
"use strict";
ttw.add_style = function(content, name){
    if(!ttw.store_styles_loaded){
        ttw.store_styles_loaded = [];
    }
    if(ttw.store_styles_loaded.indexOf(name) === -1){
        ttw.store_styles_loaded.push(name);
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = content;
        document.getElementsByTagName('head')[0].appendChild(style);
    }
}