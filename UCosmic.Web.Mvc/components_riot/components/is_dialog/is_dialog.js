riot.tag2('is_dialog', '<div id="dialog_container" riot-style="width:{opts.width}; height:{opts.height}; max-width: {opts.max_width}"> <div id="dialog_container_inner"> <fab_close if="{opts.no_close !== \'true\'}" onclick="{toggle}"></fab_close> <div id="dialog_container_inner_content"> <yield></yield> </div> </div> </div> <div id="dialog_background" data-type="{opts.type}" onclick="{toggle}" show="{is_shown && opts.no_close !== \'true\'}"> </div> <div id="dialog_background_2" data-type="{opts.type}" show="{is_shown && opts.no_close === \'true\'}"> </div>', 'is_dialog #dialog_container,[riot-tag="is_dialog"] #dialog_container{ position: fixed; top:0; bottom: 0; left: 0; right: 0; margin: auto; z-index:1; height: 0px; overflow: visible; visibility: hidden; } is_dialog #dialog_container_inner,[riot-tag="is_dialog"] #dialog_container_inner{ position: relative; top: -290px; padding: 5px; background-color: white; -webkit-border-radius:10px; -moz-border-radius:10px; border-radius: 10px; -webkit-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); -moz-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); } is_dialog #dialog_container_inner_content,[riot-tag="is_dialog"] #dialog_container_inner_content{ overflow-y: scroll; overflow-x: hidden; max-height: 600px; } is_dialog #dialog_background,[riot-tag="is_dialog"] #dialog_background,is_dialog #dialog_background_2,[riot-tag="is_dialog"] #dialog_background_2{ position: fixed; width: 100%; height:100%; top: 0; left: 0; background-color: gray; opacity: .9; } @media (max-height: 749px) { is_dialog #dialog_container_inner,[riot-tag="is_dialog"] #dialog_container_inner{ top: -150px; } is_dialog #dialog_container_inner_content,[riot-tag="is_dialog"] #dialog_container_inner_content{ max-height: 400px; } is_dialog } @media (max-height: 549px),[riot-tag="is_dialog"] } @media (max-height: 549px) { is_dialog #dialog_container_inner,[riot-tag="is_dialog"] #dialog_container_inner{ top: -50px; } is_dialog #dialog_container_inner_content,[riot-tag="is_dialog"] #dialog_container_inner_content{ max-height: 200px; } }', '', function(opts) {
var self = this;
self.on('mount', function () {
    ucosmic.load_tag('/components_riot/fab_close/fab_close.js', document.head);
});
self.is_shown = false;
self.toggle = function () {
    "use strict";
    if (!self.opts.close_callback) {
        self.is_shown = self.is_shown ? false : true;
    } else {
        self.opts.close_callback ? self.opts.close_callback(self.is_shown) : null;
        self.is_shown = self.is_shown ? false : true;
    }
    if (self.close && !self.is_shown) {
        self.close();
        self.dialog_container.length > 0 ? self.dialog_container[0].style.visibility = 'hidden' : self.dialog_container.style.visibility = 'hidden';
    } else {
        self.dialog_container.length > 0 ? self.dialog_container[0].style.visibility = 'visible' : self.dialog_container.style.visibility = 'visible';
    }
    self.update();
};
}, '{ }');