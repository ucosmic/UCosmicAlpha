riot.tag2('html_echo', '<div id="content"></div>', '', '', function(opts) {
var self = this;
self.content.innerHTML = self.opts.content;
self.update_me = function () {
    "use strict";
    self.content.innerHTML = self.opts.content;
};
});