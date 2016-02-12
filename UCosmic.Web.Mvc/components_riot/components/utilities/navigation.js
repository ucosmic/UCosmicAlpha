
// Define router function

var router = function(page,id) {
    function change_page(current_page){
        RiotControl.trigger('page_changed', current_page, ucosmic.last_page)
        ucosmic.last_page = current_page;
    }
    page = !page ? 'home' : page;
    change_page(page);
}
// Riot router
riot.route(router);
// Execute router function once for rendering the items
//riot.route.exec(router);
riot.route.start(router)
window.addEventListener('hashchange', function() {
    riot.route.exec();
});