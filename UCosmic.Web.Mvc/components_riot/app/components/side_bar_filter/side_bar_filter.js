riot.tag2('side_bar_filter', '<div class="layout vertical" id="side_bar_filter_container"> <yield></yield> </div>', 'side_bar_filter #side_bar_filter_container,[riot-tag="side_bar_filter"] #side_bar_filter_container { background-color: #ddd; border-radius: 5px; box-shadow: 1px 1px 5px black; padding: 10px; margin: 10px; }', '', function(opts) {
"use strict";
var self = this;
self.is_shown = self.opts.is_shown;

self.on('updated', function () {});
});