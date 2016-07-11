<pic>
    <style scoped>
        .boxed{
            box-shadow: 0 0 4px rgba(0,0,0,0.8);
        }
    </style>
    <div class="flex layout horizontal center center-justified">
        <div if="{opts.url}">
            <img riot-src="{calc_img_src(opts.url)}" riot-style="width:{opts.width}" class="boxed" />
        </div>
        <div if="{!opts.url}" style="  border-radius: 5px;" class=" boxed layout horizontal self-stretch flex center center-justified">
            <div>No Image</div>
        </div>
    </div>
    <script type="es6">
        "use strict";
        var self = this;
        self.calc_img_src = (image) => {
            return image.indexOf('http') > -1 ? image : '/resources/images/profiles/'+xmenu.store+'/menu/'+image;
        }
        self.on('mount', () => {

        })
    </script>
</pic>