riot.tag2('header', '<div id="header_toolbar_background"> <div style="height: 100%; width: 100%; z-index: 1; position: relative;" class="layout horizontal start-justified end"> <div id="header_toolbar_logo_container" class="layout vertical end hide_smaller"> <img id="logo_image_1" src="/resources/images/main/icon-57x57.png"> </div> <div id="header_toolbar_logo_text_container" class="layout horizontal center-justified center" style="height: 100%;"> <a href="/#home" id="logo_text" class=""><span>X</span>-Menu</a> </div> </div> <div id="header_toolbar_background_inner"></div> </div>', '#header_toolbar a { text-decoration: none; } #header_toolbar_logo_container{ margin-left: 50px; } #logo_image_1, #logo_text{ opacity: 1; } #logo_text{ font-size: 36px; margin: 0 0 0 10px; text-shadow: 0 0 1px rgba(255, 0, 0, 0.8); background-color: rgba(144,144,144, .9); border-radius: 10px; line-height: 1; padding: 4px; text-decoration: none; color: black; box-shadow: 1px 1px 5px black; } #logo_text span{ color: red; text-shadow: 0 0 2px rgba(0, 0, 0, 0.8); font-family: cursive; } #header_toolbar_background_inner{ background-image: url("/resources/images/main/menu_ordering_banner_2.png"); background-repeat: repeat; width: 100%; height: 20000px; background-attachment: local; position: absolute; top: 0; bottom: 0; left: 0; overflow: auto; } #header_toolbar_background{ background-color: rgba(102,102,102, 1); box-shadow: 0px 1px 5px black; width: 100%; height: 60px; overflow-y: hidden; opacity: 1; top: 0; position: fixed; z-index: 2; } @media (max-width: 700px), (max-height: 700px) { #header_toolbar_background { height: 40px; } #logo_image_1{ height:35px; } #logo_text { font-size: 24px; height: 26px; } #header_toolbar_logo_container{ margin-left: 25px; } } @media (max-width: 500px) { #header_toolbar_logo_container{ margin-left: 10px; } } @media (max-width: 360px) { #logo_text { font-size: 18px; height: 20px; } } @media (max-width: 326px) { .hide_smaller { display: none!important; } } @media (max-width: 290px) { #logo_text { margin:0; } }', '', function(opts) {
"use strict";
var self = this;

document.body.addEventListener('scroll', function (event) {
    var scroll_top = document.body.scrollTop;
    self.header_toolbar_background_inner.style.top = scroll_top * -1 + 'px';
}, false);

document.body.addEventListener('touchend', function (event) {
    setTimeout(function () {
        "use strict";
        var scroll_top = document.body.scrollTop;
        self.header_toolbar_background_inner.style.top = scroll_top * -1 + 'px';
    }, 1);
}, false);
});