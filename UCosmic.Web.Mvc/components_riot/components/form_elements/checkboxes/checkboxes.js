riot.tag2('checkboxes', '<div class="layout vertical"> <div id="title"> <div onclick="{toggle}" show="{!opts.title}"> <yield></yield> </div> <div onclick="{toggle}" show="{opts.title}" class="layout horizontal" style="white-space: nowrap;"> <span show="{!selected_items || selected_items.length == 0}">Select {opts.title}</span> <span style="font-weight: bold" show="{selected_items && selected_items.length > 0}">({selected_items.length})Selected {opts.title}</span> <div style="float:right; height:20px; width:20px;"> <svg viewbox="0 0 24 24" preserveaspectratio="xMidYMid meet" class="style-scope iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"> <g class="style-scope iron-icon"> <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" class="style-scope iron-icon"> </path> </g> </svg> </div> </div> <div style="height: 1px; background-color:black;"></div> </div> <div id="ddl_container" riot-style=" direction: {opts.direction};"> <ul id="list" class="{opts.pre_scale_class} {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown && opts.scale_type != \'scale_height\'} {scale_height: !is_shown && opts.scale_type == \'scale_height\'}" riot-style="background-color:{opts.background_color}; display: table; "> <li class="check_list" each="{item, i in opts.list}"> <div class="layout horizontal"> <div class="layout horizontal highlight-text checkbox_container" onclick="{select_item}" data-_id="{i}"> <input type="checkbox" value="{item.title}" __checked="{selected_items.indexOf(i) > -1}" onclick="{prevent_default}" data-_id="{i}"> <span data-_id="{i}">{item.title}</span> <span if="{item.cost}" data-_id="{i}">&nbsp;{ucosmic.currency(item.cost)}</span> </div> <div class="flex" if="{has_index(i)}"> <menu_drop_down data-_id="{i}" my_path="{my_path}" id="menu_item_ddl" list="{item.options.items}" pre_scale_class="pre_scale_top_center" is_shown="{show_option}" title="{item.options.title}" background_color="rgba(144,144,144, .9)" selected_callback="{ddl_option_selected}" selected_item_id="{item.options.selected[0]}" scale_type="scale_height" direction="ltr"> </menu_drop_down> </div> </div> </li> </ul> </div> </div>', 'checkboxes #title,[riot-tag="checkboxes"] #title{ cursor: pointer; } checkboxes #ddl_container,[riot-tag="checkboxes"] #ddl_container{ position: relative; height: 0; width: 0; overflow: visible; } checkboxes ul,[riot-tag="checkboxes"] ul{ white-space: nowrap; overflow-y: visible; margin-right: 10px; display: inline-block; padding: 10px 5px; list-style-type: none; background-color: rgba(255,255,255,.9); -webkit-border-radius:10px; -moz-border-radius:10px; border-radius:10px; box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); margin: 0; max-height: 50%; z-index: 1; width: initial; width: auto; } checkboxes li:not(:last-child),[riot-tag="checkboxes"] li:not(:last-child) { margin-bottom: 10px; } checkboxes #list,[riot-tag="checkboxes"] #list{ position: absolute; max-height: 70%; top: 0px; } checkboxes .float_text,[riot-tag="checkboxes"] .float_text{ font-size: .7em; margin:0; padding: 0; height: 0; width: 0; overflow: visible; color: gray; mix-blend-mode: difference; } checkboxes .float_text div,[riot-tag="checkboxes"] .float_text div{ position: relative; top: -1em; width: 80px; text-align: start; }', '', function(opts) {
"use strict";
var self = this;
self.is_shown = false;
self.item_selected = "";

self.has_index = function (i) {

    return self.selected_items && self.selected_items.indexOf(i) > -1;
};

self.prevent_default = function (event) {
    event.stopPropagation();
    self.select_item(event);
};
self.select_item = function (event) {
    "use strict";
    self.opts.selected_callback(parseInt(event.target.dataset._id));
};

self.ddl_option_selected = function (event, option_item_id) {
    var parent_id = find_closest(event.target, 'menu_drop_down').dataset._id;
    self.opts.list[parseInt(parent_id)].options.selected = [option_item_id];
    self.opts.selected_callback(null);
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
    }
    self.update();
};

self.get_container_width = function () {
    self.container_width = self.title.offsetWidth + 'px';
};
self.on('mount', function () {
    self.get_container_width();
});
self.on('update', function () {
    self.selected_items = self.opts.selected_items_ids;

    self.my_path = this.opts.my_path ? Object.assign({}, this.opts.my_path) : {};
    self.my_path.item_options_item = { _ids: this.opts._id };
});
}, '{ }');