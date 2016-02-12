<checkboxes>
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
            display: table;
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
        /*#title{*/
            /*cursor: pointer;*/
        /*}*/
        /*#checks_container{*/
            /*position: relative;*/
            /*overflow: visible;*/
        /*}*/
        /*ul{*/
            /*position: relative;*/
            /*margin-right: 10px;*/
            /*display: inline-block;*/
            /*padding: 10px 5px;*/
            /*list-style-type: none;*/
            /*width: 95%;*/
            /*margin: 0;*/
        /*}*/
        /*li{*/
            /*border-radius: 10px;*/
        /*}*/
        /*li:not(:last-child) {*/
            /*margin-bottom: 10px;*/
        /*}*/
        /*li.check_list{*/
            /*padding:15px;*/
        /*}*/
        /*li.check_list:nth-child(even){*/
            /*background-color: #aaaaaa;*/
        /*}*/
        /*li.check_list:nth-child(odd){*/
            /*background-color: #dddddd;*/
        /*}*/
        /*.checkbox_container{*/
            /*margin-right: 10px;*/
        /*}*/
        /*h2{*/
            /*margin-bottom: 0;*/
        /*}*/
    </style>
    <div class="layout vertical">
        <div id="title">
            <div onclick="{toggle}" show="{!opts.title}">
                <yield/>
            </div>
            <div onclick="{toggle}" show="{opts.title}" class="layout horizontal" style="white-space: nowrap;" >
                <span show="{!selected_items || selected_items.length == 0}">Select {opts.title}</span>
                <span style="font-weight: bold" show="{selected_items && selected_items.length > 0}">({selected_items.length})Selected {opts.title}</span>
                <div style="float:right; height:20px; width:20px;">
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
        <div id="ddl_container" riot-style=" direction: {opts.direction};">
            <ul id="list" class="{opts.pre_scale_class} {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown && opts.scale_type != 'scale_height'}  {scale_height: !is_shown && opts.scale_type == 'scale_height'}"
                riot-style="background-color:{opts.background_color};  display: table; ">
                <li class="check_list" each="{ item, i in opts.list }">
                    <div class="layout horizontal">
                        <div  class="layout horizontal highlight-text checkbox_container" onclick="{select_item}" data-_id="{i}">
                            <input type="checkbox" value="{item.title}" checked="{selected_items.indexOf(i) > -1}" onclick="{prevent_default}" data-_id="{i}" />
                            <span data-_id="{i}">{item.title}</span>
                            <span if="{item.cost}" data-_id="{i}">&nbsp;{xmenu.currency(item.cost)}</span>
                        </div>
                        <div class="flex" if="{has_index(i)}" >
                            <!--{JSON.stringify(item,null,2)}-->
                            <menu_drop_down data-_id="{i}" my_path="{my_path}" id="menu_item_ddl" list="{item.options.items}" pre_scale_class="pre_scale_top_center" is_shown="{show_option}" title="{item.options.title}"
                                            background_color="rgba(144,144,144, .9)"  selected_callback="{ddl_option_selected}" selected_item_id="{item.options.selected[0]}" scale_type="scale_height"  direction="ltr">
                            </menu_drop_down>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <!--<is_dialog id="menu_checkbox_dialog" _id="menu_checkbox_dialog" is_shown="{is_shown}" width="95%" max_width="600px" style="color: black" >-->
            <!--<h2>{parent.opts.title}</h2>-->
            <!--<div if="{parent.opts.free}">Comes with {xmenu.currency(parent.opts.free)} of free {parent.opts.title}</div>-->
            <!--<div id="checks_container">-->
                <!--<ul id="list">-->
                    <!--<li class="check_list" each="{ item, i in parent.opts.list }">-->
                        <!--<div class="layout horizontal">-->
                            <!--<div  class="layout horizontal highlight-text checkbox_container" onclick="{parent.parent.select_item}" data-_id="{i}">-->
                                <!--<input type="checkbox" value="{item.title}" checked="{parent.parent.selected_items.indexOf(i) > -1}" onclick="{parent.parent.prevent_default}" data-_id="{i}" />-->
                                <!--<span data-_id="{i}">{item.title}</span>-->
                                <!--<span if="{item.cost}" data-_id="{i}">&nbsp;{xmenu.currency(item.cost)}</span>-->
                            <!--</div>-->
                            <!--<div class="flex" if="{parent.parent.has_index(i)}" >-->
                                <!--<menu_drop_down data-_id="{i}" my_path="{my_path}" id="menu_item_ddl" list="{item.options.items}" pre_scale_class="pre_scale_top_center" is_shown="{parent.parent.show_option}" title="{item.options.title}"-->
                                                <!--background_color="rgba(144,144,144, .9)"  selected_callback="{parent.parent.ddl_option_selected}" selected_item_id="{item.options.selected[0]}" scale_type="scale_height"  direction="ltr">-->
                                <!--</menu_drop_down>-->
                            <!--</div>-->
                        <!--</div>-->
                    <!--</li>-->
                <!--</ul>-->
            <!--</div>-->
        <!--</is_dialog>-->
    </div>
    <script type="es6">
        "use strict";
        let self = this;
        self.is_shown = false;
        self.item_selected = "";

        self.has_index = (i) =>{

            return self.selected_items && self.selected_items.indexOf(i) > -1
        }


        self.prevent_default = (event) => {
            //event.preventDefault();
            event.stopPropagation();
            self.select_item(event);
        }
        self.select_item = function(event){
            "use strict";
            self.opts.selected_callback(parseInt(event.target.dataset._id));
        }

        self.ddl_option_selected = (event, option_item_id) =>{
            let parent_id = find_closest(event.target, 'menu_drop_down').dataset._id;
            self.opts.list[parseInt(parent_id)].options.selected = [option_item_id];
            self.opts.selected_callback(null);
            //RiotControl.trigger('menu_item_option_changed');

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
        //self.toggle = function(){
        //    "use strict";
        //    let reverseAnimate = cta(self.title, self.menu_checkbox_dialog._tag.dialog_container_inner, () => {
        //        this.menu_checkbox_dialog._tag.toggle();
        //    });
        //    this.menu_checkbox_dialog._tag.close = reverseAnimate;
        //}

        self.get_container_width = function(){
            self.container_width = self.title.offsetWidth + 'px';
        }
        self.on('mount', () => {
            self.get_container_width();
        });
        self.on('update', function() {
            self.selected_items = self.opts.selected_items_ids;

            self.my_path = this.opts.my_path ? Object.assign({}, this.opts.my_path) : {};
            self.my_path.item_options_item = {_ids: this.opts._id};

        })
    </script>
</checkboxes>