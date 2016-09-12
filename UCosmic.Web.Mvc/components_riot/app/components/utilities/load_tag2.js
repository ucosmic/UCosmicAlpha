//var ucosmic = {last_page: '', fire_ref: undefined, tags_loaded: [], user: {}};
"use strict";
ttw.load_element = function(value){
    var element = value.srcElement.src.substring(value.srcElement.src.lastIndexOf('/')+1);
    var tag_name = element.substr(0, element.indexOf('.'));
    //var dependencies = document.createElement(tag_name + '_dependencies');
    //document.body.appendChild(dependencies);
    //riot.mount(tag_name + '_dependencies');
    riot.mount(tag_name);
    RiotControl.trigger(tag_name + '_dependencies_loaded');
    RiotControl.trigger(tag_name + '_tag_loaded');
}
ttw.load_element_with_dependencies = function(value){
    var element = value.srcElement.src.substring(value.srcElement.src.lastIndexOf('/')+1);
    var tag_name = element.substr(0, element.indexOf('.'));
    var dependencies = document.createElement(tag_name + '_dependencies');
    document.body.appendChild(dependencies);
    riot.mount(tag_name + '_dependencies');
    RiotControl.one(tag_name + '_dependencies_loaded', () => {
        riot.mount(tag_name);
        RiotControl.trigger(tag_name + '_tag_loaded')
    });
}
ttw.load_js = function(url, implementationCode, location){
    var scriptTag = document.createElement('script');
    scriptTag.src = url;
    scriptTag.onload = implementationCode;
    scriptTag.onreadystatechange = implementationCode;
    location.appendChild(scriptTag);
};
ttw.load_css = function(url, implementationCode, location){
    var fileref=document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", url);
    //fileref.onreadystatechange = implementationCode;
    location.appendChild(fileref);
};
ttw.load_tag = function(url, location, has_dependencies){
    if(ttw.tags_loaded.length == 0 || ttw.tags_loaded.indexOf(url) == -1){
        if(has_dependencies){
            ttw.load_js(url, ttw.load_element_with_dependencies, location, has_dependencies);
        }else{
            ttw.load_js(url, ttw.load_element, location, has_dependencies);
        }
        ttw.tags_loaded.push(url);
        return false;
    }else{
        return true;
    }
}








ttw.load_element2 = function(value){
    var element = value.srcElement.src.substring(value.srcElement.src.lastIndexOf('/')+1);
    var tag_name = element.substr(0, element.indexOf('.'));
    //var dependencies = document.createElement(tag_name + '_dependencies');
    //document.body.appendChild(dependencies);
    //riot.mount(tag_name + '_dependencies');
    riot.mount(tag_name);
    RiotControl.trigger(tag_name + '_dependencies_loaded');
    RiotControl.trigger(tag_name + '_tag_loaded');
}
ttw.load_element_with_dependencies2 = function(value){
    var element = value.srcElement.src.substring(value.srcElement.src.lastIndexOf('/')+1);
    var tag_name = element.substr(0, element.indexOf('.'));
    var dependencies = document.createElement(tag_name + '_dependencies');
    document.body.appendChild(dependencies);
    riot.mount(tag_name + '_dependencies');
    RiotControl.one(tag_name + '_dependencies_loaded', () => {
        riot.mount(tag_name);
        RiotControl.trigger(tag_name + '_tag_loaded')
    });
}
ttw.load_js2 = function(url, implementationCode, location){
    var scriptTag = document.createElement('script');
    scriptTag.src = url;
    scriptTag.onload = implementationCode;
    scriptTag.onreadystatechange = implementationCode;
    location.appendChild(scriptTag);

    return Kefir.fromCallback(scriptTag);
};


ttw.load_tag2 = function(url, location, has_dependencies, tag_name){
    if(ttw.tags_loaded.length == 0 || ttw.tags_loaded.indexOf(url) == -1){
        ttw.tags_loaded.push(url);
        if(has_dependencies){
            return ttw.load_js2(url, ttw.load_element_with_dependencies, location, has_dependencies);
            //return Kefir.fromCallback(callback => {
            //    ttw.load_js2(url, ttw.load_element_with_dependencies, location, has_dependencies);
            //    RiotControl.on(tag_name + '_tag_loaded', () => {
            //        callback();
            //    });
            //});
        }else{
            return ttw.load_js2(url, ttw.load_element, location, has_dependencies);
            //return Kefir.fromCallback(callback => {
            //    ttw.load_js2(url, ttw.load_element, location, has_dependencies);
            //    RiotControl.on(tag_name + '_tag_loaded', () => {
            //        callback();
            //    });
            //});
        }
    }else{
        return Kefir.never();
    }
}

ttw.load_dependencies = function (dependency_list, tag_name){
    "use strict";
    if(dependency_list.length > 0){
        let dependency_list_stream = Kefir.sequentially(1, dependency_list);
        let dependency_list_stream_load = dependency_list_stream.flatMap((dependency) => {
            "use strict";
            return ttw.load_tag2(dependency.url, document.head, true, tag_name);
        });
        dependency_list_stream_load.onEnd(() => {
            RiotControl.trigger(tag_name + '_dependencies_loaded');
        });

    }else{
        RiotControl.trigger(tag_name + '_dependencies_loaded')
    }
}
