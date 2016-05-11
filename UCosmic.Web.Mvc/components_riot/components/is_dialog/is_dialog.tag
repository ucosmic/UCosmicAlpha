<is_dialog>
    <style scoped>
        #dialog_container {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            z-index: 1;
            /*height: 0px;*/
            overflow: visible;
            visibility: hidden;
            /*opacity: 0;*/
        }

        #dialog_container_inner {
            /*position: relative;*/
            /*top: -290px;*/
            max-height: 65%;
            width: 100%;
            padding: 5px;
            background-color: white;
            -webkit-border-radius: 10px;
            -moz-border-radius: 10px;
            border-radius: 10px;
            -webkit-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            -moz-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            /*padding: 20px;*/
        }

        #dialog_container_inner_content {
            overflow-y: visible;
            overflow-x: hidden;
        }

        #dialog_background, #dialog_background_2 {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background-color: gray;
            opacity: .9;
        }

        @media (max-height: 749px) {
            #dialog_container_inner_content {
                max-height: 400px;
                overflow-y: scroll;
            }
        }

        @media (max-height: 649px) {
            #dialog_container_inner_content {
                max-height: 300px;
                overflow-y: scroll;
            }
        }

        @media (max-height: 549px) {
            #dialog_container_inner_content {
                max-height: 200px;
                overflow-y: scroll;
            }
        }
    </style>
    <div id="dialog_container" class="layout vertical center center-justified" riot-style="width:{opts.width}; height:{opts.height};  max-width: {opts.max_width}; z-index: {opts.z_index};">
        <!--class="pre_scale_center_center {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown}">-->
        <div id="dialog_container_inner">
            <fab_close if="{opts.no_close !== 'true'}" onclick="{toggle}" style="z-index: 2;"></fab_close>
            <div id="dialog_container_inner_content">
                <yield/>
            </div>
            <!--<div>{opts.type}</div>-->
        </div>
    </div>
    <div id="dialog_background" data-type="{opts.type}" onclick="{toggle}" show="{is_shown && opts.no_close !== 'true'}">
    </div>
    <div id="dialog_background_2" data-type="{opts.type}" show="{is_shown && opts.no_close === 'true'}">

    </div>
    <script type="es6">
        var self = this;
        self.on('mount', () => {
            ucosmic.load_tag('/components_riot/fab_close/fab_close.js', document.head);
        });
        let scroll_top = 0;
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
                self.dialog_container.length > 0
                        ? self.dialog_container[0].style.visibility = 'hidden'
                        : self.dialog_container.style.visibility = 'hidden';
                self.dialog_container_inner_content.style.overflowY = 'hidden';
                RiotControl.trigger('dialog_toggled', -1);
            } else {
                self.dialog_container.length > 0
                        ? self.dialog_container[0].style.visibility = 'visible'
                        : self.dialog_container.style.visibility = 'visible';
                // self.dialog_container_inner_content.clientHeight < self.dialog_container_inner_content.scrollHeight ? self.dialog_container_inner_content.style.overflowY= 'scroll' : self.dialog_container_inner_content.style.overflowY= 'visible';
                RiotControl.trigger('dialog_toggled', 1);
                //self.dialog_container.style.visibility = 'visible';
            }
            self.update();
        }
        //self.on('mount', () => {
        //    self.is_shown = self.opts.is_shown;
        //});
        self.on('updated', () => {
            // self.dialog_container_inner_content.clientHeight < self.dialog_container_inner_content.scrollHeight ? self.dialog_container_inner_content.style.overflowY= 'scroll' : self.dialog_container_inner_content.style.overflowY= 'visible';

            setTimeout(() => {
                "use strict";
                self.dialog_container_inner_content.style.maxHeight = '100%';
                self.dialog_container_inner_content.style.overflowY = 'visible';
                if (self.dialog_container_inner.clientHeight < self.dialog_container_inner_content.clientHeight) {
                    setTimeout(() => {
                        "use strict";
                        self.dialog_container_inner_content.style.overflowY = 'scroll';
                        self.dialog_container_inner_content.style.maxHeight = self.dialog_container_inner.clientHeight * .9 + 'px';
                    }, 0);
                }
            }, 500);


            // setTimeout(() => {
            //     "use strict";
            //     self.dialog_container_inner_content.clientHeight < self.dialog_container_inner_content.scrollHeight ? self.dialog_container_inner_content.style.overflowY= 'scroll' : self.dialog_container_inner_content.style.overflowY= 'visible';
            // }, 500)
        });
    </script>
</is_dialog>