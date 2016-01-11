riot.tag2('echo_tag', '<div id="content"></div>', '', '', function(opts) {
var self = this;
self.update_me = function () {
    "use strict";
    var tag_name = self.opts.content.substr(self.opts.content.indexOf('\'') + 1);
    tag_name = tag_name.substr(0, tag_name.indexOf('\''));
    self.content.innerHTML = '<' + tag_name + '></' + tag_name + '>';
    var my_element = document.createElement('script');
    my_element.text = self.opts.content;

    self.content.appendChild(my_element);
    riot.mount(tag_name);
};
});