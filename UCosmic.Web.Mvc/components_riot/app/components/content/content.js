riot.tag2('content', '<div id="content_container"> <div each="{page, i in ttw.pages}" id="{page.name}_page" class="content_page_container "> <html_echo content="{page.content}"></html_echo> </div> </div>', '.content_page_container{ opacity: 0; display: none; } #content_container{ margin: 220px 0px 0px; } @media (max-width: 700px) { #content_container{ margin: 160px 0px 0px; } }', '', function(opts) {
"use strict";
var self = this;
self.on('mount', function () {});
RiotControl.on('firebase_loaded', function () {
    ttw.fire_ref.child('new').child('tennants').child(ttw.tennant).child('Pages').once("value", function (snapshot) {
        if (snapshot.val()) {
            ttw.pages = Object.keys(snapshot.val()).map(function (key) {
                return snapshot.val()[key];
            });

            ttw.pages.push({ content: '<page_not_found></page_not_found>', name: 'page_not_found', no_show: true });
            ttw.pages.unshift({ content: '<menus_page></menus_page>', name: 'menu' });

            self.update();
            RiotControl.trigger('pages_loaded', ttw.pages);
        } else {
            location.href = 'index.html#search';
        }
    });
});
RiotControl.on('pages_added', function (pages) {
    "use strict";

    self.update();
});

function fade_out_in(page, fade_type, checked) {
    function fade(element) {
        if (fade_type == 'fade_out') {
            element.classList.remove('fade_in');
            element.classList.add(fade_type);
            setTimeout(function () {
                element.style.display = 'none';
            }, 250);
        } else {
            element.style.display = 'block';
            element.classList.remove('fade_out');
            element.classList.add(fade_type);
        }
    }
    var page_name = 'page_not_found';
    ttw.pages.forEach(function (pages_page) {
        page_name = page == pages_page.name ? page : page_name;
    });
    if (checked != 50 && page_name == 'page_not_found' && fade_type == 'fade_in') {
        setTimeout(function () {
            fade_out_in(page, fade_type, checked ? checked + 1 : 1);
        }, 100);
    } else {
        var element = self[page_name + '_page'];
        if (element.length > 1) {
            element = element[element.length - 1];
            riot.mount(page_name);
        }
        fade(element);
    }
}
RiotControl.on('page_changed', function (current_page, last_page) {
    if (last_page) {
        fade_out_in(last_page, 'fade_out');
        setTimeout(function () {
            fade_out_in(current_page, 'fade_in');
        }, 250);
    } else {
        if (current_page == 'page_not_found') {
            ttw.load_tag('/components_riot/pages/page_not_found/page_not_found.js', document.head);
            setTimeout(function () {
                ttw.load_tag('/components_riot/pages/menu/menus_page.js', document.head);
            }, 1000);
        } else {
            setTimeout(function () {
                ttw.load_tag('/components_riot/pages/page_not_found/page_not_found.js', document.head);
                ttw.load_tag('/components_riot/pages/menu/menus_page.js', document.head);
            }, 1000);
        }
        fade_out_in(current_page, 'fade_in');
    }
});

if (ttw.theme) {
    var style_content = '.page_content_bg{ background-color: ' + ttw.theme.Styles.page_content_bg + '; }';
    style_content += '.page_content_fg{ color: ' + ttw.theme.Styles.page_content_fg + '; }';

    ttw.add_style(style_content, ttw.tennant);
} else {
        RiotControl.on('theme_loaded', function () {
            var style_content = '.page_content_bg{ background-color: ' + ttw.theme.Styles.page_content_bg + '; }';
            style_content += '.page_content_fg{ color: ' + ttw.theme.Styles.page_content_fg + '; }';

            ttw.add_style(style_content, ttw.tennant);
        });
    }
});