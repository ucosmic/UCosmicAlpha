riot.tag2('pic', '<div class="flex layout horizontal center center-justified"> <div if="{opts.url}"> <img riot-src="{calc_img_src(opts.url)}" riot-style="width:{opts.width}" class="boxed"> </div> <div if="{!opts.url}" style=" border-radius: 5px;" class=" boxed layout horizontal self-stretch flex center center-justified"> <div>No Image</div> </div> </div>', 'pic .boxed,[riot-tag="pic"] .boxed,[data-is="pic"] .boxed{ box-shadow: 0 0 4px rgba(0,0,0,0.8); }', '', function(opts) {
"use strict";
var self = this;
self.calc_img_src = function (image) {
    return image.indexOf('http') > -1 ? image : '/resources/images/profiles/' + ttw.store + '/menu/' + image;
};
self.on('mount', function () {});
});