riot.tag2('drop_down', '<div class="layout vertical"> <div id="title"> <div onclick="{toggle}" show="{!opts.title}"> <yield></yield> </div> <div onclick="{toggle}" show="{opts.title}"> <span show="{!selected_item}">Select {opts.title}</span> <span style="font-weight: bold" show="{selected_item}">{selected_item}</span> <div style="float:right; height:20px; width:20px;"> <svg viewbox="0 0 24 24" preserveaspectratio="xMidYMid meet" class="style-scope iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"> <g class="style-scope iron-icon"> <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" class="style-scope iron-icon"> </path> </g> </svg> </div> <div style="height: 1px; background-color:black;"></div> </div> </div> <div id="ddl_container" riot-style="width: {container_width}; direction: {opts.direction};"> <ul id="list" class="{opts.pre_scale_class} {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown && opts.scale_type != \'scale_height\'} {scale_height: !is_shown && opts.scale_type == \'scale_height\'}" riot-style="background-color:{opts.background_color}; "> <li class="highlight-text" each="{item, i in opts.list}" onclick="{select_item}" data-_id="i">{item.title}</li> </ul> </div> </div>', 'drop_down #title,[riot-tag="drop_down"] #title{ cursor: pointer; } drop_down #ddl_container,[riot-tag="drop_down"] #ddl_container{ position: relative; height: 0; width: 0; overflow: visible; } drop_down ul,[riot-tag="drop_down"] ul{ position: relative; margin-right: 10px; display: inline-block; padding: 10px 5px; list-style-type: none; background-color: rgba(255,255,255,.9); -webkit-border-radius:10px; -moz-border-radius:10px; border-radius:10px; box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); margin: 0; } drop_down li:not(:last-child),[riot-tag="drop_down"] li:not(:last-child) { margin-bottom: 10px; }', '', function(opts) {
"use strict";
var self = this;
self.is_shown = false;
self.item_selected = "";
self.select_item = function (event) {
    "use strict";

    self.toggle();

    self.opts.selected_callback(event.target.dataset._id);
};

self.document_click_handler = function (event) {
    if (!find_closest_parent(event.target, '#ddl_container')) {
        self.toggle();
    }
};

self.toggle = function () {
    "use strict";
    self.is_shown = self.is_shown ? false : true;
    if (self.is_shown) {
        setTimeout(function () {
            document.body.addEventListener("click", self.document_click_handler);
        }, 0);
    } else {
        document.body.removeEventListener("click", self.document_click_handler);
    }
    self.update();
};

self.get_container_width = function () {
    self.container_width = self.title.offsetWidth + 'px';
};
self.on('mount', function () {
    self.get_container_width();
});
}, '{ }');