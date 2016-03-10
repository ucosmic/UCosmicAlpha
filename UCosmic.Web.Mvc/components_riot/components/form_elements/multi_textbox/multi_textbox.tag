<multi_textbox>
    <style scoped>
        label{
            padding: 4px;
        }
        textarea{
            border-width: 0 0 1px 0;
            border-color: #948174;
            padding: 4px;
            margin-bottom:10px;
        }

        textarea:hover {
            background: #FFFFC1;
            border-width: 0 0 1px 0;
            border-color: #948174;

        }
        textarea:focus {
            background: #FFFF88;
            border-width: 0 0 1px 0;
            border-color: #948174;
            outline: 0;
        }
        textarea:focus:hover {
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
    </style>
    <div id="textbox_container">
        <label id="label" for="input" class="pre_scale_bottom_center {fade_in: is_shown} {fade_out: !is_shown} {slide_top_bottom: !is_shown}">{opts.place_holder}</label>
        <br/>
        <textarea type="{opts.type}" min="{opts.min}" max="{opts.max}" step="{opts.step}" cols="{opts.cols}" rows="{opts.rows}" onfocus="{show_label}" pattern="{opts.pattern}" placeholder="{opts.place_holder}" name="{opts.name}" onkeyup="{show_label}" id="input"
               autocomplete="on" maxlength="{opts.max_length}" disabled="{opts.disabled}" value="{opts.input_value}" riot-style="width: {opts.width}; height: {opts.height}">
            </textarea>
        <br/>
        <span class="validation_message_container" show="{validation_message}" >
            <span class="validation_message"  riot-style="width: {opts.width}; height: {opts.height}"><span>{validation_message}</span></span>
        </span>
    </div>
    <script type="es6">
        "use strict";
        let self = this;
        self.is_shown = false;
        self.validation_message = '';
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
        //
        //self.check_pwd = function (value) {
        //    if (value.length == 0) {
        //        return  "Password required";
        //    } else if (value.length < 6) {
        //        return  "Too short";
        //    } else if (value.length > 20) {
        //        //alert("too_long");
        //        return "Too long";
        //        //} else if (value.search(/\d/) == -1) {
        //        //    alert("no_num");
        //        //    return("no_num");
        //        //} else if (value.search(/[a-zA-Z]/) == -1) {
        //        //    alert("no_letter");
        //        //    return("no_letter");
        //    } else if (value.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) != -1) {
        //        return ("Character not allowed");
        //    }
        //    return ("");
        //}
        self.validate = function(){
            self.textbox_container.classList.add('invalid');
            if(self.input.validationMessage){
                self.validation_message = 'Please correct ' + self.opts.place_holder + '.';
                let validation_message = self.input.validationMessage;
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
</multi_textbox>