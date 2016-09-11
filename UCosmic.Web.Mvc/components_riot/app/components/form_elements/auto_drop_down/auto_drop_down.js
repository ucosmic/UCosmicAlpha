riot.tag2('auto_drop_down', '<div class="layout vertical"> <div id="title"> <div class="layout horizontal end"> <div onclick="{toggle_open}"> <div> <div class="{float_text: selected_item} " show="{selected_item}"><div>{opts.title}</div></div> <textbox id="input1" onkeyup="{filter}" input_autocomplete="off" input_style="background-color: transparent; border: none; padding: 0; line-height: 20px; height: 25px;" no_clear="true" show="{!selected_item}" id="text" type="text" name="text" place_holder="{opts.title}" width="170px;" autofocus></textbox> <textbox id="input2" onkeyup="{filter}" input_autocomplete="off" input_style="background-color: transparent; border: none; padding: 0; line-height: 20px; height: 25px;" no_clear="true" show="{selected_item}" id="text" type="text" name="text" place_holder="{opts.title}" width="170px;" input_value="{selected_item.title}" autofocus></textbox> </div> </div> <div class="flex"></div> <div style="height:20px; width:40px; cursor: pointer;" onclick="{toggle}"> <svg viewbox="0 0 24 24" preserveaspectratio="xMidYMid meet" class="style-scope iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"> <g class="style-scope iron-icon"> <path show="{is_shown}" d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" class="style-scope iron-icon"> </path> <path show="{!is_shown}" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" class="style-scope iron-icon"> </path> </g> </svg> </div> </div> <div style="height: 1px; background-color:black;"></div> </div> <div id="ddl_container" riot-style=" direction: {opts.direction}; left: {opts.ddl_container_left}; overflow:{is_shown ? \'visible\': \'hidden\'};"> <div id="list_div" class="{opts.pre_scale_class} {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown && opts.scale_type != \'scale_height\'} {scale_height: !is_shown && opts.scale_type == \'scale_height\'}"> <ul id="list_ul" riot-style="background-color:{opts.background_color}; max-height:{opts.max_height}; width:{opts.max_width} "> <li class="layout horizontal start-justified highlight-text" each="{item, i in list}" onclick="{select_item}" data-_id="{item._id}"> <span style="display: flex; white-space: normal;" data-_id="{item._id}" data-text="{item.title}">{item.title}</span> </li> <li show="{!list}" class="layout horizontal start-justified"> <span style="display: flex; white-space: normal;">Loading</span> <is_loading is_showing="true" show="true" height="20px" width="20px;" container_width="80px;" color="green"> </is_loading> </li> </ul> </div> </div> </div>', 'auto_drop_down #title,[riot-tag="auto_drop_down"] #title,[data-is="auto_drop_down"] #title{ cursor: pointer; } auto_drop_down #ddl_container,[riot-tag="auto_drop_down"] #ddl_container,[data-is="auto_drop_down"] #ddl_container{ position: relative; height: 0; width: 0; z-index: 1; } auto_drop_down ul,[riot-tag="auto_drop_down"] ul,[data-is="auto_drop_down"] ul{ white-space: nowrap; overflow-y: visible; margin-right: 10px; display: inline-block; padding: 10px 5px; list-style-type: none; background-color: rgba(255,255,255,.9); -webkit-border-radius:10px; -moz-border-radius:10px; border-radius:10px; box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); margin: 0; max-height: 50%; z-index: 1; width: initial; width: auto; } auto_drop_down li,[riot-tag="auto_drop_down"] li,[data-is="auto_drop_down"] li{ margin-right: 15px; cursor: pointer; } auto_drop_down li:not(:last-child),[riot-tag="auto_drop_down"] li:not(:last-child),[data-is="auto_drop_down"] li:not(:last-child){ margin-bottom: 10px; } auto_drop_down #list,[riot-tag="auto_drop_down"] #list,[data-is="auto_drop_down"] #list{ position: inherit; max-height: 70%; top: 0px; } auto_drop_down .float_text,[riot-tag="auto_drop_down"] .float_text,[data-is="auto_drop_down"] .float_text{ font-size: .7em; margin:0; padding: 0; height: 0; width: 0; overflow: visible; color: gray; mix-blend-mode: difference; white-space: nowrap; } auto_drop_down .float_text div,[riot-tag="auto_drop_down"] .float_text div,[data-is="auto_drop_down"] .float_text div{ position: relative; top: -1em; width: 80px; text-align: start; }', '', function(opts) {
"use strict";
var self = this;
self.is_shown = false;
self.item_selected = "";

self.select_item = function (event, id) {
    "use strict";

    self.toggle();

    self.opts.selected_callback = self.find_function(self.opts.selected_callback);
    var text = "";
    if (event) {
        text = event.target.dataset.text && event.target.dataset.text != '[clear]' ? event.target.dataset.text : "";
        self.input1._tag.input.value = text;
        self.input2._tag.input.value = text;
        if (event.target.dataset._id == 0) {
            self.input1._tag.input.value = "";
        }
    }

    if (id !== undefined) {
        self.opts.selected_callback(id);
    } else {
        self.opts.selected_callback(parseInt(event.target.dataset._id), text);
        if (event.target.dataset._id == 0) {
            self.filter(null, "");
        } else {
            self.filter(null, event.target.dataset.text);
        }
    }
    setTimeout(function () {
        self.input2._tag.show_label();
    }, 0);
};

self.document_click_handler = function (event) {
    if (!find_closest_parent(event.target, '#ddl_container')) {
        self.toggle();
    }
};

self.toggle_open = function (event) {
    self.is_shown ? null : self.toggle(event);
    event.stopPropagation();
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
self.filter = function (e, text) {
    var text = text != null ? text : e.target.value;
    if (text == "") {
        self.list = self.original_list;
        self.select_item(null, -0);
    } else {
        self.list = _.filter(self.original_list, function (item) {
            return _.startsWith(item.title.toLowerCase(), text.toLowerCase()) || item.title == '[clear]';
        });
    }
    setTimeout(function () {
        self.list && self.list.length > 0 ? (self.get_container_width(), self.get_list_height()) : null;
    }, 0);
};

self.set_selected_id = function (id) {
    self.opts.selected_item_id = id;
    if (self.list && id != 0) {
        self.find_selected_item(self.list[0]);
        self.update();
    }
};

self.find_selected_item = function (default_item) {
    self.selected_item = self.opts.selected_item_id != undefined && self.list ? self.list.find(function (val, index) {
        return val._id == self.opts.selected_item_id;
    }) : default_item && default_item.length > 0 ? default_item[0] : null;

    self.selected_item ? self.filter(null, self.selected_item.title) : null;
    setTimeout(function () {
        self.input2._tag.show_label();
    }, 0);
};

self.update_original_list = function (list) {
    list.unshift({ _id: 0, title: '[clear]' });
    self.original_list = list;
    self.list = list;
    var default_item = undefined;
    if (self.list && self.list.length > 0) {
        if (self.list.length > 1 || self.opts.selected_item_id !== undefined) {
            default_item = self.list.filter(function (item) {
                if (item["default"]) {
                    return item;
                }
            });
        } else {
            default_item = [self.list[0]];
        }
    }
    if (self.opts.selected_item_id && self.opts.selected_item_id != 0) {
        self.find_selected_item(default_item);
    }

    self.update();
    setTimeout(function () {
        self.list && self.list.length > 0 ? (self.get_container_width(), self.get_list_height()) : null;
    }, 0);
};

self.find_function = function (func_or_string) {
    var orig = func_or_string;
    if (typeof func_or_string == "string") {
        var index = orig.indexOf(".");
        if (index > -1) {
            func_or_string = window[orig.substring(0, index)];
            orig = orig.substring(index + 1);
            index = orig.indexOf(".");
            if (index > -1) {
                func_or_string = func_or_string[orig.substring(0, index)];
                orig = orig.sub(index + 1);
                func_or_string = func_or_string[orig];
            } else {
                func_or_string = func_or_string[orig];
            }
        } else {
            func_or_string = window[orig];
        }
    }
    return func_or_string;
};

self.on('mount', function () {
    self.get_container_width();
    self.get_list_height();
});

self.on('update', function () {});
});