<toast>
    <style scoped>
        #toast_container{
            position: fixed;
            width: 100%;
            /*height: 0;*/
            overflow: visible;
            bottom: 0px;
            right: 10px;
            z-index: 2500;
        }
        #toast_container #message{

            /*right: 100px;*/
            padding: 5px 0 5px 5px;
            list-style-type: none;
            /*width: 90px;*/
            /*height: 30px;*/
            background-color: rgba(255,255,255,.9);
            -webkit-border-radius:10px;
            -moz-border-radius:10px;
            border-radius:10px;
            box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            margin: 10px 0;
        }
        fab_close #fab_close_button{
            border: solid 2px white;
        }
    </style>
    <div id="toast_container" class="layout horizontal end-justified">
        <div class="flex"></div>
        <div id="message" class=" layout horizontal start start-justified pre_scale_bottom_right {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown}"
            riot-style="background-color:{color}; color:{forecolor}; margin: 20px;">
            <div class="layout vertical center center-justified self-stretch" style="padding: 5px 45px 5px 5px;"><div>{message}</div></div>
            <fab_close onclick="{close}" style=" width: inherit;  position: relative;  left: 20px; height: 35px;"></fab_close>
        </div>
    </div>
    <script type="es6">
        "use strict";
        var self = this;
        self.is_shown = false;
        ttw.load_tag('/components_riot/fab_close/fab_close.js', document.head);
        let my_interval;
        self.toggle = function(message, color, forecolor, timeout){
            "use strict";
            self.is_shown = self.is_shown ? false : true;
            self.toast_container.style.height = self.is_shown ? '' : '0';
            self.toast_container.style.zIndex = self.is_shown ? '2500' : '-1';
            self.color = color;
            self.forecolor = forecolor;
            self.message = message;
            self.update();
            clearInterval(my_interval);
            my_interval = setInterval(() =>{
                self.is_shown = self.is_shown ? false : true;
                self.toast_container.style.height = self.is_shown ? '' : '0';
                self.toast_container.style.zIndex = self.is_shown ? '2500' : '-1';
                self.update();
                clearInterval(my_interval);
            }, timeout);
        }
        self.close = () =>{
            clearInterval(my_interval);
            self.is_shown = false;
            self.toast_container.style.height = self.is_shown ? '' : '0';
            self.toast_container.style.zIndex = self.is_shown ? '2500' : '-1';
        }
        self.on('mount', () => {
            self.toast_container.style.height = '0';
        })
    </script>
</toast>