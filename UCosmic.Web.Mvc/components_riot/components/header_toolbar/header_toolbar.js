riot.tag2('header_toolbar', '<login id="login_tag"></login> <account id="account_tag" user="{user}"></account> <div id="header_toolbar" class="layout horizontal start-justified"> <div class="flex"></div> <div id="header_toolbar_menu_container" class="layout horizontal start-justified"> <a href="#search" class="toolbar_icon"> <span> <svg viewbox="0 0 24 24" preserveaspectratio="xMidYMid meet" style="pointer-events: none; display: block; width: 100%; height: 100%;"> <g> <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"> </path> </g> </svg> </span> </a> <span class="toolbar_item highlight-text" onclick="{toggle_login}" show="{(!ucosmic.user || !ucosmic.user.email) && is_login_loaded}"> Sign Up/In </span> <span class="toolbar_icon" onclick="{toggle_account}" show="{ucosmic.user && ucosmic.user.email}"> <span> <svg viewbox="0 0 24 24" preserveaspectratio="xMidYMid meet" style="pointer-events: none; display: block; width: 100%; height: 100%;"> <g> <path d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z" class="style-scope iron-icon"></path> </g> </svg> </span> </span> <a href="#contact" class="toolbar_item highlight-text hide_small"> Contact </a> <a href="/index2.html#tennant" class="toolbar_item highlight-text hide_small" show="{ucosmic.user && ucosmic.user.email}"> tennant </a> <drop_down id="menu_drop_down" selected_callback="{menu_drop_down_selected}" list="{pages}" is_shown="{menu_is_shown}" class="header_toolbar_fg" background_color="rgba(144,144,144, .9)" pre_scale_class="pre_scale_top_right" direction="rtl"> <span class="toolbar_icon hide_big header_toolbar_fg"> <span> <svg viewbox="0 0 24 24" preserveaspectratio="xMidYMid meet" class="style-scope iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"> <g class="style-scope iron-icon"> <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" class="style-scope iron-icon"> </path> </g> </svg> </span> </span> </drop_down> </div> </div>', '#header_toolbar { height: 50px; position: fixed; right: 0px; top: 0px; width: 100%; padding: 4px 0; } #header_toolbar a { text-decoration: none; } .toolbar_icon { fill: white; height: 100%; width: 50px; margin: 0 10px; display: flex; justify-content: center; align-content: center; flex-direction: column; } .toolbar_icon:hover { stroke: black; stroke-width: .2; cursor: pointer; } .toolbar_icon span { height: 80%; } .toolbar_item, li { color: white; display: flex; justify-content: center; align-content: center; flex-direction: column; font-size: 24px; margin: 0 10px; text-shadow: 0 0 0 #000; } .hide_small { display: flex; } .hide_big { display: none; } #header_toolbar_menu_container{ background-color: rgba(128,128,128, .9); border-radius:10px; margin-right: 10px; box-shadow: 1px 1px 5px black; } @media (max-width: 700px), (max-height: 700px) { #header_toolbar { height: 30px; } .toolbar_icon { width: 30px; } .toolbar_item, li { font-size: 18px; } } @media (max-width: 500px) { .hide_small { display: none; } .hide_big { display: flex; } }', '', function(opts) {

var self = this;
RiotControl.on('account_mounted', function () {
    self.update();
});
RiotControl.on('login_mounted', function () {
    self.is_login_loaded = true;
    self.update();
});

self.menu_is_shown = false;
self.pages = [{ title: 'Home' }, { title: 'Contact' }];
self.toggle_login = function () {
    self.login_tag._tag.toggle_login();
};
self.toggle_account = function () {
    self.account_tag._tag.toggle_account();
};

self.toggle_menu = function () {
    self.menu_is_shown = self.menu_is_shown ? false : true;
    self.menu_drop_down._tag.toggle();
};
self.menu_drop_down_selected = function (_id) {
    var url = self.pages[_id].title.toLowerCase();
    if (url == 'tennant') {
        window.location = '/index2.html#!/ucosmic/my_tennant';
    } else {
        window.location.hash = url;
    }
};
self.on('mount', function () {
    var firebase_loaded = function firebase_loaded() {
        function get_user(authData) {
            var user = { email: '', first_name: '', last_name: '', display_name: '', uid: authData.uid };
            switch (authData.provider) {
                case 'password':

                    user.email = authData.password.email;

                    return user;
                case 'google':
                    user.first_name = authData.google.cachedUserProfile.given_name;
                    user.last_name = authData.google.cachedUserProfile.family_name;

                    user.email = authData.google.email;

                    return user;
                case 'facebook':
                    user.first_name = authData.facebook.cachedUserProfile.first_name;
                    user.last_name = authData.facebook.cachedUserProfile.last_name;

                    user.email = authData.facebook.email;
                    return user;
            }
        }

        function on_auth(snapshot) {

            return function (authData) {
                var tennant_name = 'ucosmic';
                if (authData) {
                    console.log("Authenticated successfully with payload2:", authData);
                    ucosmic.fire_ref_user = ucosmic.fire_ref.child("Users").child(authData.uid);
                    ucosmic.fire_ref_user.on("value", function (profile) {

                        if (ucosmic.user && ucosmic.user.email && profile.val()) {
                            ucosmic.user = profile.val();
                        } else {
                            var user = get_user(authData);

                            ucosmic.user = {
                                provider: authData.provider,
                                first_name: profile.val() && profile.val().first_name ? profile.val().first_name : user.first_name ? user.first_name : '',

                                last_name: profile.val() && profile.val().last_name ? profile.val().last_name : user.last_name ? user.last_name : '',
                                display_name: profile.val() && (profile.val().last_name || profile.val().first_name) ? profile.val().last_name + " " + profile.val().first_name : user.first_name ? user.first_name + " " + user.last_name : profile.val() && profile.val().email ? profile.val().email : user.email,
                                is_owner: true,
                                phone: profile && profile.val() && profile.val().phone ? profile.val().phone : '',
                                email: user.email ? user.email : profile.val() ? profile.val().email : '',
                                uid: authData.uid,
                                tennant_name: user.tennant_name ? user.tennant_name : profile.val() && profile.val().tennant_name ? profile.val().tennant_name : 'Not set'
                            };
                            if (!profile.val() && user.email) {
                                ucosmic.fire_ref.child("Emails").push({
                                    users_email: user.email,
                                    tennants_name: tennant_name,
                                    users_name: user.display_name,
                                    subject: 'Welcome to ' + tennant_name,
                                    html: user.first_name + ", <br/><br/>Thank you for registering for " + tennant_name + ". \
                                    <br/><br/> Please var us know if you have any questions! <br /> <br /> \
                                    Sincerely <br /> " + tennant_name + " Staff",
                                    text: user.first_name + ", thank you for registering for " + tennant_name + ". \
                                    Please var us know if you have any questions! \
                                    Sincerely - " + tennant_name + " Staff",
                                    is_sent: false,
                                    timeSubmitted: Firebase.ServerValue.TIMESTAMP
                                });
                            }
                        }
                        ucosmic.user.uid = authData.uid;

                        if (Object.equal(ucosmic.user != profile.val())) {
                            ucosmic.fire_ref_user.set(ucosmic.user);
                        }

                        ucosmic.load_tag('/components_riot/account/account.js', document.head);
                        self.pages.push({ title: 'tennant' });
                    });
                } else {
                        if (ucosmic.user) {
                            ucosmic.user = {};
                        }

                        ucosmic.load_tag('/components_riot/login/login.js', document.head);
                    }

                riot.update();
            };
        }

        ucosmic.fire_ref = new Firebase("https://UCosmic.firebaseio.com");
        RiotControl.trigger('firebase_loaded', ucosmic.fire_ref);
        ucosmic.fire_ref.onAuth(on_auth());
    };
    ucosmic.load_js('/bower_components/firebase/firebase.js', firebase_loaded, document.head);
});
}, '{ }');