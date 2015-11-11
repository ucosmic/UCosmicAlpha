riot.tag('layout', '<is_dialog id="login_dialog" is_shown="{login_is_shown}" width="95%" max_width="400px" type="login" close="{close_dialog_test}"> </is_dialog> <is_dialog id="account_dialog" is_shown="{account_is_shown}" width="95%" max_width="400px" type="account" close="{close_dialog_test}"> </is_dialog>', function(opts) {
        this.login_is_shown = true;
        this.close_dialog_test = function(teset){
            alert(teset)
        }
    
});
riot.tag('is_dialog', '<div id="dialog_container" onclick="{close_dialog}" riot-style="width:{opts.width}; height:{opts.height}; max-width: {opts.max_width}" class="pre_scale_center_center {fade_in: opts.is_shown} {fade_out: !opts.is_shown} {scale: !opts.is_shown}"> <div>{opts.type}</div> </div> <div id="dialog_background" data-type="{opts.type}" onclick="{close_dialog}"> </div>', '#dialog_container{ background-color: white; -webkit-border-radius:10px; -moz-border-radius:10px; border-radius: 10px; -webkit-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); -moz-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4); position: fixed; top:0; bottom: 0; left: 0; right: 0; display: table; margin: auto; z-index:1; } #dialog_background{ position: fixed; width: 100%; height:100%; top: 0; left: 0; }', function(opts) {
        this.close_dialog = function(event){

            this.opts.close(this);
        }
        this.on('mount', function(){
            var test = 1;
        })
    
});