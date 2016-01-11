//var ucosmic = {last_page: '', fire_ref: undefined, tags_loaded: [], user: {}};
ucosmic.load_element = function(value){
    var element = value.srcElement.src.substring(value.srcElement.src.lastIndexOf('/')+1);
    var tag_name = element.substr(0, element.indexOf('.'));
    riot.mount(tag_name);
    RiotControl.trigger(tag_name + '_tag_loaded')
}
ucosmic.load_js = function(url, implementationCode, location){
    var scriptTag = document.createElement('script');
    scriptTag.src = url;
    scriptTag.onload = implementationCode;
    scriptTag.onreadystatechange = implementationCode;
    location.appendChild(scriptTag);
};
ucosmic.load_css = function(url, implementationCode, location){
    var fileref=document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", url);
    //fileref.onreadystatechange = implementationCode;
    location.appendChild(fileref);
};
ucosmic.load_tag = function(url, location){
    if(ucosmic.tags_loaded.length == 0 || ucosmic.tags_loaded.indexOf(url) == -1){
        ucosmic.load_js(url, ucosmic.load_element, location);
        ucosmic.tags_loaded.push(url);
        return false;
    }else{
        return true;
    }
    //else{
    //    RiotControl.trigger(tag_name + '_tag_already_loaded')
    //}
    //else{
    //    var element = url.substring(url.lastIndexOf('/')+1);
    //    //var tag_name = element.substr(0, element.indexOf('.'));
    //    //riot.mount(tag_name);
    //    var tags = document.getElementsByTagName(element.substr(0, element.indexOf('.')));
    //    if(tags[0] && tags[0]._tag.update_me){
    //        for (var i = 0; i < tags.length; ++i) {
    //            tags[i]._tag.update_me();
    //        }
    //    }
    //    //tags.forEach(function(value){
    //    //    "use strict";
    //    //    value._tag.update();
    //    //});
    //}
}
