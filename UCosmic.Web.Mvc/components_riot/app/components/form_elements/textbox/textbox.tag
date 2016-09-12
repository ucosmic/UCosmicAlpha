<textbox>
    <style scoped>
        label{
            padding: 4px;
            color: gray;
            z-index: -1;
        }
        input{
            border-width: 0 0 1px 0;
            border-color: #948174;
            padding: 4px;
            margin-bottom:10px;
            width: 100%;
        }

        input:hover {
            background: #FFFFC1;
            border-width: 0 0 1px 0;
            border-color: #948174;

        }
        input:focus {
            background: #FFFF88;
            border-width: 0 0 1px 0;
            border-color: #948174;
            outline: 0;
        }
        input:focus:hover {
            background: #FFFF88;
            border-width: 0 0 1px 0;
            border-color: #948174;
            outline: 0;
        }
        .validation_message_container{
            position: relative;
            height: 0;
            overflow-y:visible;
        }
        .validation_message{
            color: red;
            position: absolute;
            width: inherit;;
            top: -10px;
        }
        .invalid{
            color: red!important;
        }
        .invalid input{
            border-color: red;
        }
        #textbox_close{
            cursor: pointer;
            width: 0;
            position: relative;
            /*right: 1em;*/
            top: .3em;
            overflow: visible;
            width:1em;
        }
    </style>
    <style>
        .float_text{
            display: none;
        }
    </style>
    <div id="textbox_container" riot-style="font-size: {opts.font_size}">
        <label id="label" for="input" class="pre_scale_bottom_center {fade_in: is_shown} {fade_out: !is_shown} {slide_top_bottom: !is_shown}">{opts.place_holder}</label>

        <div class="layout horizontal">
            <input type="{opts.type}" min="{opts.min}" max="{opts.max}" step="{opts.step}" onfocus="{show_label}" pattern="{opts.pattern}" placeholder="{opts.place_holder}"
                   name="{opts.name}" onkeyup="{show_label}" id="input"
                   autocomplete="{opts.input_autocomplete}" maxlength="{opts.max_length}" disabled="{opts.disabled}" value="{opts.input_value}"
                   riot-style="max-width: {opts.width}; height: {opts.height}; font-size: 1em; {opts.input_style}">
            <div if="{!opts.disabled && !opts.no_clear}" onclick="{clear}" id="textbox_close" class="layout horizontal start start-justified" >
                <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block; width: .8em; height: .8em; fill: red;">
                    <g>
                        <path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z">
                        </path>
                    </g>
                </svg>
            </div>
        </div>
        <span class="validation_message_container" show="{validation_message}" >
            <span class="validation_message"  riot-style="width: {opts.width}; height: {opts.height}"><span>{validation_message}</span></span>
        </span>
    </div>
    <script type="es6">
        "use strict";
        let self = this;
        self.is_shown = false;
        self.validation_message = '';
        self.clear = () => {
            if(!self.opts.disabled){
                self.input.value = '';
                var e = document.createEvent("HTMLEvents");
                e.initEvent('keyup', false, true);
                e.keyCode = 1813;
                self.input.dispatchEvent(e);
            }
        }
        self.on('mount', function(){
            if(!self.opts.pattern){
                self.input.removeAttribute("pattern");
            }
            if(self.opts.required){
                self.input.setAttribute("required", '');
            }
            if(self.opts.input_value){
                self.show_label();
            }
        })
        self.show_label = function(){
            if(self.input.value){
                self.is_shown = true;
            }else{
                self.is_shown = false;
            }
            self.update();
            return true;
        }

        self.check_pwd = function (value) {
            if (value.length == 0) {
                return  "Password required";
            } else if (value.length < 6) {
                return  "Too short";
            } else if (value.length > 20) {
                //alert("too_long");
                return "Too long";
                //} else if (value.search(/\d/) == -1) {
                //    alert("no_num");
                //    return("no_num");
                //} else if (value.search(/[a-zA-Z]/) == -1) {
                //    alert("no_letter");
                //    return("no_letter");
            } else if (value.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) != -1) {
                return ("Character not allowed");
            }
            return ("");
        }
        self.validate = function(){
            self.textbox_container.classList.add('invalid');
            if(self.input.validationMessage){
                self.validation_message = 'Please correct ' + self.opts.place_holder + '.';
                let validation_message = self.input.validationMessage;
                self.update();
                return validation_message;
            }else if(self.opts.type == 'password' && self.check_pwd(self.input.value)){
                self.validation_message = 'Please correct ' + self.opts.place_holder + '.';
                let validation_message = self.check_pwd(self.input.value);
                self.update();
                return validation_message;
            }else {
                self.validation_message = '';
                self.textbox_container.classList.remove('invalid');
                self.update();
                return '';
            }
        }
    </script>
</textbox>