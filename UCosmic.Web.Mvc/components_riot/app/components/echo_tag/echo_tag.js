riot.tag2('echo_tag', '<div id="content"></div>', '', '', function(opts) {
var self = this;
self.update_me = function (content, is_encoded, mount) {
    "use strict";
    content = is_encoded ? decodeURI(content) : content;
    var tag_name = content.substr(content.indexOf('\'') + 1);
    tag_name = tag_name.substr(0, tag_name.indexOf('\''));
    self.content.innerHTML = '<' + tag_name + '></' + tag_name + '>';
    var my_element = document.createElement('script');
    my_element.text = content;

    self.content.appendChild(my_element);
    mount ? riot.mount(tag_name) : null;
};
});