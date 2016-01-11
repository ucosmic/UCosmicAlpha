riot.tag2('echo_html', '<div id="content"></div>', '', '', function(opts) {
var self = this;
self.content.innerHTML = self.opts.content;
self.update_me = function () {
    "use strict";
    var my_element = document.createElement('div');
    my_element.innerHTML = self.opts.content;

    self.content.appendChild(my_element);
};
});