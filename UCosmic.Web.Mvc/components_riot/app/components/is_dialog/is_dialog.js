riot.tag2('is_dialog', '<div id="dialog_container" class="layout vertical center center-justified" riot-style="width:{opts.width}; height:{opts.height}; max-width: {opts.max_width}; z-index: {opts.z_index};"> <div id="dialog_container_inner"> <fab_close if="{opts.no_close !== \'true\'}" onclick="{toggle}" style="z-index: 2;"></fab_close> <div id="dialog_container_inner_content"> <yield></yield> </div> </div> </div> <div id="dialog_background" data-type="{opts.type}" onclick="{toggle}" show="{is_shown && opts.no_close !== \'true\'}"> </div> <div id="dialog_background_2" data-type="{opts.type}" show="{is_shown && opts.no_close === \'true\'}"> </div>', 'is_dialog #dialog_container,[riot-tag="is_dialog"] #dialog_container,[data-is="is_dialog"] #dialog_container{ position: fixed; top: 0; bottom: 0; left: 0; right: 0; margin: auto; z-index: 1; overflow: visible; visibility: hidden; } is_dialog #dialog_container_inner,[riot-tag="is_dialog"] #dialog_container_inner,[data-is="is_dialog"] #dialog_container_inner{ max-height: 65%; width: 100%; padding: 5px; background-color: white; -webkit-border-radius: 10px; -moz-border-radius: 10px; border-radius: 10px; -webkit-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); -moz-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); } is_dialog #dialog_container_inner_content,[riot-tag="is_dialog"] #dialog_container_inner_content,[data-is="is_dialog"] #dialog_container_inner_content{ overflow-y: visible; overflow-x: hidden; } is_dialog #dialog_background,[riot-tag="is_dialog"] #dialog_background,[data-is="is_dialog"] #dialog_background,is_dialog #dialog_background_2,[riot-tag="is_dialog"] #dialog_background_2,[data-is="is_dialog"] #dialog_background_2{ position: fixed; width: 100%; height: 100%; top: 0; left: 0; background-color: gray; opacity: .9; } @media (max-height: 749px) { is_dialog #dialog_container_inner_content,[riot-tag="is_dialog"] #dialog_container_inner_content,[data-is="is_dialog"] #dialog_container_inner_content{ max-height: 400px; overflow-y: scroll; } } @media (max-height: 649px) { is_dialog #dialog_container_inner_content,[riot-tag="is_dialog"] #dialog_container_inner_content,[data-is="is_dialog"] #dialog_container_inner_content{ max-height: 300px; overflow-y: scroll; } } @media (max-height: 549px) { is_dialog #dialog_container_inner_content,[riot-tag="is_dialog"] #dialog_container_inner_content,[data-is="is_dialog"] #dialog_container_inner_content{ max-height: 200px; overflow-y: scroll; } }', '', function(opts) {
var _this = this;

var self = this;
ttw.load_tag('/components_riot/fab_close/fab_close.js', document.head);
self.on('mount', function () {
    self = _this;
});
var scroll_top = 0;
self.toggle = function () {
    "use strict";
    if (!self.opts.close_callback) {
        self.is_shown = self.is_shown ? false : true;
    } else {
        self.opts.close_callback ? self.opts.close_callback(self.is_shown) : null;
        self.is_shown = self.is_shown ? false : true;
    }
    if (!self.is_shown) {
        window.removeEventListener('resize', resize.bind(self), true);
        self.dialog_container.length > 0 ? self.dialog_container[0].style.visibility = 'hidden' : self.dialog_container.style.visibility = 'hidden';
        self.dialog_container_inner_content.style.overflowY = 'hidden';
        RiotControl.trigger('dialog_toggled', -1);
    } else {
        resize(self);
        window.addEventListener('resize', resize.bind(self), true);
        self.dialog_container.length > 0 ? self.dialog_container[0].style.visibility = 'visible' : self.dialog_container.style.visibility = 'visible';

        RiotControl.trigger('dialog_toggled', 1);
    }
    self.update();
};

resize = function (test) {
    "use strict";
    setTimeout(function () {
        "use strict";
        test = test && test.type != 'resize' ? test : self;

        if (test.dialog_container_inner_content.clientHeight != 0) {
            if (test.dialog_container_inner.clientHeight < test.dialog_container_inner_content.clientHeight) {
                setTimeout(function () {
                    "use strict";
                    test.dialog_container_inner_content.style.overflowY = 'scroll';
                    test.dialog_container_inner_content.style.maxHeight = test.dialog_container_inner.clientHeight * .9 + 'px';
                }, 0);
            } else {
                test.dialog_container_inner_content.style.maxHeight = '100%';
                test.dialog_container_inner_content.style.overflowY = 'visible';
                if (test.is_shown) {
                    resize(test);
                }
            }
        } else if (test.is_shown) {
            resize(test);
        }
    }, 250);
};

self.on('updated', function () {});
});