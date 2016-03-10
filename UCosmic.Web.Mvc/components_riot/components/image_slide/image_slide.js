riot.tag2('image_slide', '<div class="layout horizontal center center-justified" if="{opts.list && opts.list.length > 0}"> <div onclick="{left}" class="image_list_icon left" if="{opts.list.length > 1}"> <svg viewbox="0 0 24 24" preserveaspectratio="xMidYMid meet" style="pointer-events: none; display: inline-block; width: 3em; "> <g> <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"> </path> </g> </svg> </div> <div each="{image, i in opts.list}"> <img riot-src="{calc_img_src(image)}" style="width: 100%;" show="{i == parent.image_index}"> </div> <div onclick="{right}" class="image_list_icon right" if="{opts.list.length > 1}"> <svg viewbox="0 0 24 24" preserveaspectratio="xMidYMid meet" style="pointer-events: none; display: inline-block; width: 3em; "> <g> <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"> </path> </g> </svg> </div> </div>', 'image_slide img,[riot-tag="image_slide"] img{ margin: 0; } image_slide .image_list_icon,[riot-tag="image_slide"] .image_list_icon{ cursor: pointer; position: relative; } image_slide .image_list_icon.left,[riot-tag="image_slide"] .image_list_icon.left{ right: .8em; width:1.5em; overflow: visible; } image_slide .image_list_icon.right,[riot-tag="image_slide"] .image_list_icon.right{ right: .8em; width:1.5em; overflow: visible; } @media (max-width: 500px) { image_slide img,[riot-tag="image_slide"] img{ width: 100%; } }', '', function(opts) {
"use strict";
var self = this;
self.calc_img_src = function (image) {
    return image.link.indexOf('http') > -1 ? image.link : '/resources/images/profiles/' + ucosmic.store + '/menu/' + image.link;
};
self.image_index = 0;
self.on('mount', function () {});
self.left = function () {
    self.image_index != 0 ? self.image_index -= 1 : self.image_index = self.list_length - 1;
};
self.right = function () {
    self.image_index != self.list_length - 1 ? self.image_index += 1 : self.image_index = 0;
};
self.on('update', function () {

    self.list_length = self.opts.list ? self.opts.list.length : 0;
});
}, '{ }');
<!--<menu_item_image_dependencies>-->
    <!--<script type="es6">-->
        <!--let dependency_list = []-->
        <!--ucosmic.load_dependencies(dependency_list, 'menu_item_image')-->
    <!--</script>-->
<!--</menu_item_image_dependencies>-->