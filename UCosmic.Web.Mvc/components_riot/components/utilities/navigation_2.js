"use strict";
var SharedMixin = {
    observable: riot.observable()
};

var ucosmic_app_store = new app_store()
RiotControl.addStore(ucosmic_app_store)
riot.mount('layout'); // Kickoff the Riot app.
riot.mount('is_loading');
// Define router function

if(!ucosmic.pages){
    var router = function (tennant, page) {
        function change_page(current_page) {
            if(ucosmic.last_page){
                RiotControl.trigger('page_changed', current_page, ucosmic.last_page)
                ucosmic.last_page = current_page;
            }else{
                RiotControl.on('pages_loaded', function () {
                    "use strict";
                    RiotControl.trigger('page_changed', current_page, ucosmic.last_page)
                    ucosmic.last_page = current_page;
                });
            }
        }

        page = !page ? 'home' : page;
        
        RiotControl.trigger('router_started');
            
        change_page(page);
    }
    //riot.route(router);
    //riot.route.start(router);
    //window.addEventListener('hashchange', function() {
    //    riot.route.exec();
    //});
}else{
    var router = function (tennant, page) {
        function change_page(current_page) {
            RiotControl.trigger('page_changed', current_page, ucosmic.last_page)
            ucosmic.last_page = current_page;
        }

        RiotControl.trigger('router_started');
        page = !page ? 'home' : page;
        change_page(page);
    }
    //riot.route(router);
    //riot.route.start(router);
    //window.addEventListener('hashchange', function() {
    //    riot.route.exec();
    //});
}
riot.route(router);
riot.route.start(router);
window.addEventListener('hashchange', function() {
    riot.route.exec();
});