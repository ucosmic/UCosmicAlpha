
ucosmic.load_element = function(value){
    //RiotControl.trigger(tag_name + '_tag_loaded');
    var element = value.srcElement ? value.srcElement.src.substring(value.srcElement.src.lastIndexOf('/')+1) : value.currentTarget.src.substring(value.currentTarget.src.lastIndexOf('/')+1);
    var tag_name = element.substr(0, element.indexOf('.'));
    //var dependencies = document.createElement(tag_name + '_dependencies');
    //document.body.appendChild(dependencies);
    //riot.mount(tag_name + '_dependencies');
    riot.mount(tag_name);
    RiotControl.trigger(tag_name + '_dependencies_loaded');
    RiotControl.trigger(tag_name + '_tag_loaded');
}
//ucosmic.load_element_with_dependencies = function(value){
//    var element = value.srcElement.src.substring(value.srcElement.src.lastIndexOf('/')+1);
//    var tag_name = element.substr(0, element.indexOf('.'));
//    var dependencies = document.createElement(tag_name + '_dependencies');
//    document.body.appendChild(dependencies);
//    riot.mount(tag_name + '_dependencies');
//    RiotControl.one(tag_name + '_dependencies_loaded', () => {
//        riot.mount(tag_name);
//        RiotControl.trigger(tag_name + '_tag_loaded')
//    });
//}
ucosmic.load_js = function(url, implementationCode, location){
    var scriptTag = document.createElement('script');
    if(window.location.href.indexOf('localhost') == -1){
        url = url.replace(".js", ".min.js")
    }
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
ucosmic.load_tag = function(url, location, has_dependencies){
    if(ucosmic.tags_loaded.length == 0 || ucosmic.tags_loaded.indexOf(url) == -1){
        if(has_dependencies){
            ucosmic.load_js(url, ucosmic.load_element_with_dependencies, location, has_dependencies);
        }else{
            ucosmic.load_js(url, ucosmic.load_element, location, has_dependencies);
        }
        ucosmic.tags_loaded.push(url);
        return false;
    }else{
        return true;
    }
}



ucosmic.load_element2 = function(callback, value){
    var element = value.srcElement ? value.srcElement.src.substring(value.srcElement.src.lastIndexOf('/')+1) : value.currentTarget.src.substring(value.currentTarget.src.lastIndexOf('/')+1);//value.srcElement.src.substring(value.srcElement.src.lastIndexOf('/')+1);
    var tag_name = element.substr(0, element.indexOf('.'));
    riot.mount(tag_name);
    RiotControl.trigger(tag_name + '_dependencies_loaded');
    RiotControl.trigger(tag_name + '_tag_loaded');
    callback();
}

ucosmic.load_element_with_dependencies2 = function(callback, value){
    var element = value.srcElement ? value.srcElement.src.substring(value.srcElement.src.lastIndexOf('/')+1) : value.currentTarget.src.substring(value.currentTarget.src.lastIndexOf('/')+1);//value.srcElement.src.substring(value.srcElement.src.lastIndexOf('/')+1);
    var tag_name = element.substr(0, element.indexOf('.'));
    var dependencies = document.createElement(tag_name + '_dependencies');
    RiotControl.on(tag_name + '_dependencies_loaded', function() {
        riot.mount(tag_name);
        RiotControl.trigger(tag_name + '_tag_loaded');
        callback();
    });
    document.body.appendChild(dependencies);
    riot.mount(tag_name + '_dependencies');
}

ucosmic.load_js2 = function(url, implementationCode, location){
    var my_retrun_stream = Kefir.stream(function(emitter) {
        var scriptTag = document.createElement('script');
        var onload = function(value) {
            var call_back = function() {
                emitter.emit();
                emitter.end();
            }
            implementationCode(call_back, value);
        }
        scriptTag.src = url;
        scriptTag.onload = onload;
        scriptTag.onreadystatechange = onload;
        scriptTag.onError = function(err){
            emitter.error(err);
        }
        location.appendChild(scriptTag);
    });
    return my_retrun_stream;
};

ucosmic.load_tag2 = function(url, location, has_dependencies){
    if(ucosmic.tags_loaded.length == 0 || ucosmic.tags_loaded.indexOf(url) == -1){
        ucosmic.tags_loaded.push(url);
        if(has_dependencies){
            return ucosmic.load_js2(url, ucosmic.load_element_with_dependencies2, location);
        }else{
            return ucosmic.load_js2(url, ucosmic.load_element2, location);
        }
    }else{
        return Kefir.never();
    }
}

//ucosmic.load_dependencies = function (dependency_list, tag_name){
//    "use strict";
//    if(dependency_list.length > 0){
//        let dependency_list_stream = Kefir.sequentially(1, dependency_list);
//        let dependency_list_stream_load = dependency_list_stream.flatMap(function(dependency) {
//            "use strict";
//            return ucosmic.load_tag2(dependency.url, document.head, dependency.has_dependencies === undefined ? true : false);
//        });
//        dependency_list_stream_load.onEnd(function() {
//            RiotControl.trigger(tag_name + '_dependencies_loaded');
//        });
//    }else{
//        RiotControl.trigger(tag_name + '_dependencies_loaded')
//    }
//}

//ucosmic.load_tag_firebase = function(url, location){
//    var formated_url = 'Files' + url.replace(".", "_");
//    ucosmic.fire_ref.child(formated_url).once("value", function (snapshot) {
//        if(snapshot.val()){
//            RiotControl.trigger('account_tag_loaded_fb');
//            var my_element = document.createElement('script');
//            my_element.text = snapshot.val().content;
//
//            location.appendChild(my_element);
//
//
//
//            var element = url.substring(url.lastIndexOf('/')+1);
//            var tag_name = element.substr(0, element.indexOf('.'));
//            riot.mount(tag_name);
//            //RiotControl.trigger(tag_name + '_dependencies_loaded');
//        }else{
//
//        }
//    });
//}
//
//setTimeout(function(){
//    console.log(Date.now(), 'test_started')
//    ucosmic.load_tag_firebase('/components_riot/account/account.js', document.head);
//    RiotControl.on('account_tag_loaded_fb', function (event) {
//        console.log(Date.now(), 'account_loaded_fb')
//    });
//    ucosmic.load_tag('/components_riot/account/account.js', document.head);
//    RiotControl.on('account_tag_loaded', function (event) {
//        console.log(Date.now(), 'account_loaded')
//    });
//}, 5000)