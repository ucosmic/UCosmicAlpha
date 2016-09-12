<checkbox>
    <style scoped>
        #ddl_container{
            position: relative;
            width: 0;
            height: 0;
            overflow: visible;
        }
        ul{
            position: relative;
            margin-right: 10px;
            display: inline-block;
            padding: 10px 5px;
            list-style-type: none;
            background-color: rgba(255,255,255,.9);
            -webkit-border-radius:10px;
            -moz-border-radius:10px;
            border-radius:10px;
            box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            margin: 10px 0;
        }
        li:not(:last-child) {
            margin-bottom: 10px;
        }
    </style>
    <div id="ddl_container" riot-style="top: {opts.top}; ">
        <ul id="list" class="pre_scale_top_right {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown}"
            riot-style="background-color:{opts.background_color};   ">
            <li class="highlight-text" each="{ item, i in opts.list }" onclick="{select_item}">{item.title}</li>
        </ul>
    </div>
    <script type="es6">
        "use strict";
        let self = this;
        self.is_shown = false;
        self.select_item = function(event){
            "use strict";
            self.is_shown = false;
            self.update();
            RiotControl.trigger(self.opts._id + '_selected_changed', event);
        }
        self.toggle = function(){
            "use strict";
            self.is_shown = self.is_shown ? false : true;
            self.update();
        }
    </script>
</checkbox>