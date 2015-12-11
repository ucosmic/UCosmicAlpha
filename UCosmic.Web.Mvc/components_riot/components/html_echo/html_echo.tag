<html_echo>
    <div id="content"></div>
    <script type="es6">
        var self = this;
        self.content.innerHTML = self.opts.content;
        self.update_me = function(){
            "use strict";
            self.content.innerHTML = self.opts.content;
        }
    </script>
</html_echo>