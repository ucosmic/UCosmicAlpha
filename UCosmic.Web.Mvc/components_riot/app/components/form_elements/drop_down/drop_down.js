riot.tag2('drop_down', '<div class="layout vertical"> <div id="title"> <div class="layout horizontal end" onclick="{toggle}"> <div show="{!opts.title}"> <yield></yield> </div> <div show="{opts.title}"> <div> <div class="{float_text: selected_item} " show="{selected_item}"><div>{opts.title}</div></div> <div show="{!selected_item}"><div>Select {opts.title}</div></div> <div style="font-weight: bold" show="{selected_item}">{selected_item.title}<span if="{selected_item.cost}" data-_id="{i}">&nbsp;{ttw.currency(selected_item.cost)}</span></div> </div> </div> <div class="flex"></div> <div style="height:20px; width:40px;"> <svg viewbox="0 0 24 24" preserveaspectratio="xMidYMid meet" class="style-scope iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"> <g class="style-scope iron-icon"> <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" class="style-scope iron-icon"> </path> </g> </svg> </div> </div> <div style="height: 1px; background-color:black;"></div> </div> <div id="ddl_container" riot-style=" direction: {opts.direction}; left: {opts.ddl_container_left}; overflow:{is_shown ? \'visible\': \'hidden\'};"> <div id="list" class="{opts.pre_scale_class} {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown && opts.scale_type != \'scale_height\'} {scale_height: !is_shown && opts.scale_type == \'scale_height\'}"> <ul id="list_ul" riot-style="background-color:{opts.background_color}; max-height:{opts.max_height}; width:{opts.max_width} "> <li class="layout horizontal start-justified highlight-text" each="{item, i in list}" onclick="{select_item}" data-_id="{i}"> <span style="display: flex; white-space: normal;" data-_id="{i}">{item.title}</span><span if="{item.cost}" data-_id="{i}">&nbsp;{ttw.currency(item.cost)}</span> </li> </ul> </div> </div> </div>', 'drop_down #title,[riot-tag="drop_down"] #title,[data-is="drop_down"] #title{ cursor: pointer; } drop_down #ddl_container,[riot-tag="drop_down"] #ddl_container,[data-is="drop_down"] #ddl_container{ position: relative; height: 0; width: 0; z-index: 1; } drop_down ul,[riot-tag="drop_down"] ul,[data-is="drop_down"] ul{ white-space: nowrap; overflow-y: visible; margin-right: 10px; display: inline-block; padding: 10px 5px; list-style-type: none; background-color: rgba(255,255,255,.9); -webkit-border-radius:10px; -moz-border-radius:10px; border-radius:10px; box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); margin: 0; max-height: 50%; z-index: 1; width: initial; width: auto; } drop_down li,[riot-tag="drop_down"] li,[data-is="drop_down"] li{ margin-right: 15px; } drop_down li:not(:last-child),[riot-tag="drop_down"] li:not(:last-child),[data-is="drop_down"] li:not(:last-child){ margin-bottom: 10px; } drop_down #list,[riot-tag="drop_down"] #list,[data-is="drop_down"] #list{ position: inherit; max-height: 70%; top: 0px; } drop_down .float_text,[riot-tag="drop_down"] .float_text,[data-is="drop_down"] .float_text{ font-size: .7em; margin:0; padding: 0; height: 0; width: 0; overflow: visible; color: gray; mix-blend-mode: difference; white-space: nowrap; } drop_down .float_text div,[riot-tag="drop_down"] .float_text div,[data-is="drop_down"] .float_text div{ position: relative; top: -1em; width: 80px; text-align: start; }', '', function(opts) {
"use strict";
var self = this;
self.is_shown = false;
self.item_selected = "";

self.select_item = function (event, id) {
    "use strict";

    self.toggle();
    if (id !== undefined) {
        self.opts.selected_callback(id);
    } else {
        self.opts.selected_callback(parseInt(event.target.dataset._id));
    }
};

self.document_click_handler = function (event) {
    if (!find_closest_parent(event.target, '#ddl_container')) {
        self.toggle();
    }
};

self.toggle = function (event) {
    "use strict";
    self.is_shown = self.is_shown ? false : true;
    if (self.is_shown) {
        setTimeout(function () {
            document.body.addEventListener("click", self.document_click_handler);
        }, 0);
    } else {
        document.body.removeEventListener("click", self.document_click_handler);
        self.get_list_height();
    }
    self.update();
};

self.get_container_width = function () {
    self.container_width = self.title.offsetWidth + 'px';
};
self.get_list_height = function () {
    if (self.list_ul.length > 1) {
        self.list_ul[0].style.overflowY = self.list_ul[0].scrollHeight > self.list_ul[0].offsetHeight ? 'scroll' : 'visible';
    } else {
        self.list_ul.style.overflowY = self.list_ul.scrollHeight > self.list_ul.offsetHeight ? 'scroll' : 'visible';
    }
};
self.on('mount', function () {
    self.get_container_width();
    self.get_list_height();
});
self.on('update', function () {
    var default_item = undefined;
    if (self.opts.list && self.opts.list.length > 0) {
        if (self.opts.list.length > 1 || self.opts.selected_item_id !== undefined) {
            default_item = self.opts.list.filter(function (item) {
                if (item["default"]) {
                    return item;
                }
            });
        } else {
            default_item = [self.opts.list[0]];
        }
    }
    self.opts.list && self.opts.list.length > 0 ? (self.get_container_width(), self.get_list_height()) : null;
    self.list = self.opts.list;
    self.selected_item = self.opts.selected_item_id != undefined && self.opts.list ? self.opts.list[self.opts.selected_item_id] : default_item && default_item.length > 0 ? default_item[0] : null;
});
});