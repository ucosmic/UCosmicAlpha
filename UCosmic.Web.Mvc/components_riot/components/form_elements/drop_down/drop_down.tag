<drop_down>
    <style scoped>
        #title{
            cursor: pointer;
        }
        #ddl_container{
            position: relative;
            height: 0;
            width: 0;
            overflow: visible;
        }
        ul{
            position: fixed;
            margin-right: 10px;
            display: inline-block;
            padding: 10px 5px;
            list-style-type: none;
            background-color: rgba(255,255,255,.9);
            -webkit-border-radius:10px;
            -moz-border-radius:10px;
            border-radius:10px;
            box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            margin: 0;
            z-index: 1;
            width: initial;
        }
        li:not(:last-child) {
            margin-bottom: 10px;
        }
        .float_text{
            font-size: .7em;
            margin:0;
            padding: 0;
            height: 0;
            width: 0;
            overflow: visible;
            /*opacity: .7;*/
            color: gray;
            mix-blend-mode: difference;
        }
        .float_text div{
            position: relative;
            top: -1em;
            width: 80px;
            text-align: start;
        }
    </style>
    <div class="layout vertical">
        <div id="title">
            <div onclick="{toggle}" show="{!opts.title}">
                <yield/>
            </div>
            <div onclick="{toggle}" show="{opts.title}">
                <div class="layout horizontal">
                    <div>
                        <div class="{float_text: selected_item} " show="{selected_item}"><div>{opts.title}</div></div>
                        <div show="{!selected_item}"><div>Select {opts.title}</div></div>
                        <!--<div class="{float_text: selected_item} pre_scale_bottom_center {slide_top_bottom: !selected_item}"><div>Select {opts.title}</div></div>-->
                        <div style="font-weight: bold" show="{selected_item}">{selected_item.title}</div>
                    </div>
                    <div class="flex"></div>
                    <div style="height:20px; width:20px;">
                        <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="style-scope iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;">
                            <g class="style-scope iron-icon">
                                <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" class="style-scope iron-icon">
                                </path>
                            </g>
                        </svg>
                    </div>
                </div>
                <div style="height: 1px; background-color:black;"></div>
            </div>
            <!--<div onclick="{toggle}" show="{opts.title}" class="layout horizontal">-->
                <!--<span show="{!selected_item}">Select {opts.title}</span>-->
                <!--<span style="font-weight: bold" show="{selected_item}">{selected_item.title}</span>-->
                <!--<div style="float:right; height:20px; width:20px;">-->
                            <!--<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="style-scope iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;">-->
                                <!--<g class="style-scope iron-icon">-->
                                    <!--<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" class="style-scope iron-icon">-->
                                    <!--</path>-->
                                <!--</g>-->
                            <!--</svg>-->
                <!--</div>-->
                <!--<div style="height: 1px; background-color:black;"></div>-->
            <!--</div>-->
        </div>
        <div id="ddl_container" riot-style=" direction: {opts.direction};">
            <!--<div id="ddl_container" riot-style="width: {container_width}; direction: {opts.direction};">-->
            <ul id="list" class="{opts.pre_scale_class} {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown && opts.scale_type != 'scale_height'}  {scale_height: !is_shown && opts.scale_type == 'scale_height'}"
                riot-style="background-color:{opts.background_color};   ">
                <!--<li class="highlight-text" each="{ item, i in opts.list }" onclick="{select_item}" data-_id="{i}">{item.title}</li>-->
                <li class="layout horizontal start-justified highlight-text" each="{ item, i in opts.list }" onclick="{select_item}" data-_id="{i}">
                    <span style="display: flex;" data-_id="{i}">{item.title}</span><span if="{item.cost}" data-_id="{i}">&nbsp;{ucosmic.currency(item.cost)}</span>
                </li>
            </ul>
        </div>
    </div>
    <script type="es6">
        "use strict";
        let self = this;
        self.is_shown = false;
        self.item_selected = "";
        self.selected_item = self.opts.selected_item_id ? self.opts.list[self.opts.selected_item_id] : null;

        self.select_item = function(event){
            "use strict";
            //self.is_shown = false;
            //self.update();
            self.toggle();

            //self.opts.selected_item_id = [event.target.dataset._id];//ids;

            //RiotControl.trigger(self.opts._id + '_selected_changed', event);
            self.opts.selected_callback(parseInt(event.target.dataset._id));
            //self.opts.selected_callback(null);


        }


        self.document_click_handler = function(event){
            if(!find_closest_parent(event.target, '#ddl_container')){
                self.toggle();
            }
        }

        self.toggle = function(event){
            "use strict";
            self.is_shown = self.is_shown ? false : true;
            if(self.is_shown){
                self.list.style.top = (event.target.getBoundingClientRect().top + event.target.offsetHeight) + 'px';
                setTimeout(function(){
                    document.body.addEventListener("click", self.document_click_handler);
                }, 0);
            }else{
                document.body.removeEventListener("click", self.document_click_handler);
            }
            self.update();
        }

        self.get_container_width = function(){
            self.container_width = self.title.offsetWidth + 'px';
        }
        self.on('mount', () => {
            self.get_container_width();
        });
        self.on('update', function() {
            let default_item
            if(self.opts.list && self.opts.list.length > 0){
                default_item = self.opts.list.filter(function(item){
                    if(item.default){
                        return item;
                    }
                });
            }
            self.get_container_width();
            self.selected_item = self.opts.selected_item_id != undefined ? self.opts.list[self.opts.selected_item_id] : default_item && default_item.length > 0 ? default_item[0] : null;
        })
    </script>
</drop_down>