riot.tag2('is_dialog', '<div id="dialog_container" riot-style="width:{opts.width}; height:{opts.height}; max-width: {opts.max_width}" class="pre_scale_center_center {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown}"> <div id="dialog_container_inner"> <fab_close onclick="{toggle}"></fab_close> <yield></yield> <div>{opts.type}</div> </div> </div> <div id="dialog_background" data-type="{opts.type}" onclick="{toggle}" show="{is_shown}"> </div>', '#dialog_container{ position: fixed; top:0; bottom: 0; left: 0; right: 0; margin: auto; z-index:1; height: 0px; overflow: visible; } #dialog_container_inner{ position: relative; top: -150px; background-color: white; -webkit-border-radius:10px; -moz-border-radius:10px; border-radius: 10px; -webkit-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); -moz-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); } #dialog_background{ position: fixed; width: 100%; height:100%; top: 0; left: 0; }', '', function(opts) {
        var self = this;
        self.on('mount', function () {
            ucosmic.load_tag('/components_riot/is_dialog/fab_close/fab_close.js', document.head);
        });
        self.is_shown = false;
        self.select_item = function(event){
            "use strict";
            self.is_shown = false;
            self.update();

        }
        self.toggle = function(){
            "use strict";
            self.is_shown = self.is_shown ? false : true;
            self.update();
        }
}, '{ }');