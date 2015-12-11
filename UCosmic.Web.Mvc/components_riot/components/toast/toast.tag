<toast>
    <style>
        toast #toast_container{
            position: fixed;
            width: 100%;
            height: 0;
            overflow: visible;
            bottom: 70px;
            right: 10px;
        }
        toast #toast_container #message{

            /*right: 100px;*/
            padding: 10px 5px;
            list-style-type: none;
            /*width: 90px;*/
            height: 30px;
            background-color: rgba(255,255,255,.9);
            -webkit-border-radius:10px;
            -moz-border-radius:10px;
            border-radius:10px;
            box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            margin: 10px 0;
        }
    </style>
    <div id="toast_container" class="layout horizontal end-justified">
        <div class="flex"></div>
        <div id="message" class=" layout horizontal center center-justified pre_scale_bottom_right {fade_in: is_shown} {fade_out: !is_shown} {scale: !is_shown}"
            riot-style="background-color:{color}; color:{forecolor}">{message}
        </div>
    </div>
    <script type="es6">
        "use strict";
        var self = this;
        self.is_shown = false;
        self.toggle = function(message, color, forecolor, timeout){
            "use strict";
            self.is_shown = self.is_shown ? false : true;
            self.color = color;
            self.forecolor = forecolor;
            self.message = message;
            self.update();
            setTimeout(() =>{
                self.is_shown = self.is_shown ? false : true;
                self.update();
            }, timeout);
        }
    </script>
</toast>