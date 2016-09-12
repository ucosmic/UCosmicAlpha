<header_toolbar>
    <style>
        #header_toolbar {
            height: 50px;
            position: fixed;
            right: 0px;
            top: 0px;
            width: 100%;
            padding: 4px 0;
        }

        #header_toolbar a {
            text-decoration: none;
        }
        .toolbar_icon {
            fill: white;
            height: 100%;
            width: 50px;
            margin: 0 10px;
            display: flex;
            justify-content: center;
            align-content: center;
            flex-direction: column;
        }

        .toolbar_icon:hover {
            stroke: black;
            stroke-width: .2;
            cursor: pointer;

        }

        .toolbar_icon span {
            height: 80%;
        }

        .toolbar_item, li {
            color: white;
            display: flex;
            justify-content: center;
            align-content: center;
            flex-direction: column; /* column | row */
            font-size: 24px;
            margin: 0 10px;
            text-shadow: 0 0 0 #000;
        }

        .hide_small {
            display: flex;
        }

        .hide_big {
            display: none;
        }


        #header_toolbar_menu_container{
            background-color: rgba(128,128,128, .9);
            border-radius:10px;
            margin-right: 10px;
            box-shadow: 1px 1px 5px black;
        }
        @media (max-width: 700px), (max-height: 700px) {

            #header_toolbar {
                height: 30px;
            }

            .toolbar_icon {
                width: 30px;
            }

            .toolbar_item, li {
                font-size: 18px;
            }
        }

        @media (max-width: 500px) {
            .hide_small {
                display: none;
            }

            .hide_big {
                display: flex;
            }
        }
    </style>
    <login id="login_tag"></login>
    <account id="account_tag" user="{user}"></account>
    <div id="header_toolbar" class="layout horizontal start-justified">
        <div class="flex"></div>
        <div id="header_toolbar_menu_container" class="layout horizontal start-justified">
            <a href="#search" class="toolbar_icon">
                <span>
                    <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"
                         style="pointer-events: none; display: block; width: 100%; height: 100%;">
                        <g>
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z">
                            </path>
                        </g>
                    </svg>
                </span>
            </a>
            <span class="toolbar_item highlight-text" onclick="{toggle_login}" show="{(!ttw.user || !ttw.user.email) && is_login_loaded}">
                Sign Up/In
            </span>
            <span class="toolbar_icon" onclick="{toggle_account}" show="{ttw.user && ttw.user.email}">
                <span>
                    <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"
                         style="pointer-events: none; display: block; width: 100%; height: 100%;">
                        <g>
                            <path d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z" class="style-scope iron-icon"></path>
                        </g>
                    </svg>
                </span>
            </span>
                <!--<a href="#home" class="toolbar_item highlight-text hide_small">-->
                    <!--Home-->
                <!--</a>-->
                <!--<a href="#benefits" class="toolbar_item highlight-text hide_small">-->
                    <!--Benefits-->
                <!--</a>-->
                <a href="#contact" class="toolbar_item highlight-text hide_small">
                    Contact
                </a>
                <a href="/index2.html#tennant" class="toolbar_item highlight-text hide_small" show="{ttw.user && ttw.user.email}">
                    tennant
                </a>
            <!--<span class="toolbar_icon hide_big" onclick="{toggle_menu}">-->
                <!--<span>-->
                    <!--<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="style-scope iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;">-->
                        <!--<g class="style-scope iron-icon">-->
                            <!--<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" class="style-scope iron-icon">-->
                            <!--</path>-->
                        <!--</g>-->
                    <!--</svg>-->
                <!--</span>-->
            <!--</span>-->

            <!--<div style="width:0;">-->
                <!--<drop_down id="menu_drop_down" selected_callback="{menu_drop_down_selected}" top="20px" list="{pages}" is_shown="{menu_is_shown}" background_color="rgba(144,144,144, .9)"></drop_down>-->
            <!--</div>-->
            <drop_down id="menu_drop_down" selected_callback="{menu_drop_down_selected}" list="{pages}" is_shown="{menu_is_shown}"
                       class="header_toolbar_fg"  background_color="rgba(144,144,144, .9)"  pre_scale_class="pre_scale_top_right" direction="rtl">
                    <span class="toolbar_icon hide_big header_toolbar_fg">
                        <span>
                            <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="style-scope iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;">
                                <g class="style-scope iron-icon">
                                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" class="style-scope iron-icon">
                                    </path>
                                </g>
                            </svg>
                        </span>
                    </span>
            </drop_down>
        </div>

    </div>
    <script type="es6">
        //this.close = () => {
        //    if (this.RgModal.dismissable) this.RgModal.isvisible = false
        //}
        var self = this;
        RiotControl.on('account_mounted', function () {
            self.update();
        });
        RiotControl.on('login_mounted', function () {
            self.is_login_loaded = true;
            self.update();
        });
        //RiotControl.on('logged_in', function () {
        //    self.update();
        //});
        //RiotControl.on('logged_out', function () {
        //    self.update();
        //});

        self.menu_is_shown = false;
        self.pages = [{title: 'Home'}, {title: 'Contact'}]
        self.toggle_login = function () {
            self.login_tag._tag.toggle_login()
        }
        self.toggle_account = function () {
            self.account_tag._tag.toggle_account()
        }

        self.toggle_menu = function () {
            self.menu_is_shown = self.menu_is_shown ? false : true;
            self.menu_drop_down._tag.toggle();
        }
        self.menu_drop_down_selected = function(_id) {
            var url = self.pages[_id].title.toLowerCase();
            if (url == 'tennant') {
                window.location = '/index2.html#!/ucosmic/my_tennant';
            } else {
                window.location.hash = url;
            }
        }
        self.on('mount', function () {
            var firebase_loaded = function () {
                function get_user(authData) {
                    var user = {email: '', first_name: '', last_name: '', display_name: '', uid: authData.uid};
                    switch (authData.provider) {
                        case 'password':

                            user.email = authData.password.email;
                            //user.display_name = authData.password.email;
                            return user;
                        case 'google':
                            user.first_name = authData.google.cachedUserProfile.given_name;
                            user.last_name = authData.google.cachedUserProfile.family_name;
                            //user.display_name = authData.google.displayName;
                            user.email = authData.google.email;

                            return user;
                        case 'facebook':
                            user.first_name = authData.facebook.cachedUserProfile.first_name;
                            user.last_name = authData.facebook.cachedUserProfile.last_name;
                            //user.display_name = authData.facebook.displayName;
                            user.email = authData.facebook.email;
                            return user;
                    }
                }

                function on_auth(snapshot) {

                    return function (authData) {
                        var tennant_name = 'ucosmic';
                        if (authData) {
                            console.log("Authenticated successfully with payload2:", authData);
                            ttw.fire_ref_user = ttw.fire_ref.child("Users").child(authData.uid);
                            ttw.fire_ref_user.on("value", function (profile) {

                                if (ttw.user && ttw.user.email && profile.val()) {
                                    ttw.user = profile.val();
                                } else {
                                    var user = get_user(authData);

                                    ttw.user = {
                                        provider: authData.provider,
                                        first_name: profile.val() && profile.val().first_name ? profile.val().first_name : user.first_name ? user.first_name : '',
//                            first_name: user.first_name ? user.first_name : (profile.val() && profile.val().first_name ? profile.val().first_name :''),
                                        last_name: profile.val() && profile.val().last_name ? profile.val().last_name : user.last_name ? user.last_name : '',
                                        display_name: profile.val() && (profile.val().last_name || profile.val().first_name) ? profile.val().last_name + " " + profile.val().first_name : user.first_name ? user.first_name + " " + user.last_name : profile.val() && profile.val().email ? profile.val().email : user.email,
                                        is_owner: true,
                                        phone: profile && profile.val() && profile.val().phone ? profile.val().phone : '',
                                        email: user.email ? user.email : (profile.val() ? profile.val().email : ''),
                                        uid: authData.uid
                                        , tennant_name: user.tennant_name ? user.tennant_name : (profile.val() && profile.val().tennant_name ? profile.val().tennant_name : 'Not set')
                                    }
                                    if (!profile.val() && user.email) {
                                        ttw.fire_ref.child("Emails").push({
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
                                            is_sent: false
                                            , timeSubmitted: Firebase.ServerValue.TIMESTAMP
                                        });
                                    }
//                                ttw.user = user;
                                }
                                ttw.user.uid = authData.uid;

                                if (Object.equal(ttw.user != profile.val())) {
                                    ttw.fire_ref_user.set(ttw.user);
                                }

                                //check if account loaded and if not load it.
                                ttw.load_tag('/components_riot/account/account.js', document.head);
                                self.pages.push({title: 'tennant'})
//                                RiotControl.trigger('add_page', 'tennant');
                            });
                        } else {
                            if (ttw.user) {
                                ttw.user = {};
                            }
                            //check if login loaded and if not load it.
                            ttw.load_tag('/components_riot/login/login.js', document.head);
                        }

                        riot.update();
                    }
                }

                ttw.fire_ref = new Firebase("https://ucosmic.firebaseio.com");
                RiotControl.trigger('firebase_loaded', ttw.fire_ref);// may not need this
                ttw.fire_ref.onAuth(on_auth());
            }
            ttw.load_js('/bower_components/firebase/firebase.js', firebase_loaded, document.head);

            //scrollHandler();
        });
        //function getScrollTop(){
        //    if(typeof pageYOffset!= 'undefined'){
        //        //most browsers except IE before #9
        //        return pageYOffset;
        //    }
        //    else{
        //        var B= document.body; //IE 'quirks'
        //        var D= document.documentElement; //IE with doctype
        //        D= (D.clientHeight)? D: B;
        //        return D.scrollTop;
        //    }
        //}
        //var scroll_past_header = false, big_logo = document.querySelector('#header_logo_image_1'), header_height = document.body.offsetWidth > 700 ? 140 : 110;
        //var scrollHandler = (event) => {
        //
        //    if (!big_logo) {
        //        big_logo = document.querySelector('#header_logo_image_1');
        //        if(!big_logo){
        //            setTimeout(function(){
        //                scrollHandler(event);
        //            }, 50)
        //            return;
        //        }
        //    }
        //    var scroller_top = getScrollTop();
        //
        //    if (scroller_top < header_height) {
        //        scroll_past_header = false;
        //        var myVal = ((scroller_top / header_height) - 1) * -1;
        //        big_logo.style.opacity = myVal;
        //        if (myVal < .50) {
        //            var myVal = ((.5 - myVal) * 2);
        //            this.logo_image_1.style.opacity = myVal;
        //            this.header_toolbar_background.style.opacity = myVal;
        //            this.header_toolbar_menu_container.style.backgroundColor = 'rgba(144,144,144, ' + (1 - myVal) + ')';
        //        } else {
        //            this.logo_image_1.style.opacity = 0;
        //            this.header_toolbar_background.style.opacity = 0;
        //            this.header_toolbar_menu_container.style.backgroundColor = 'rgba(144,144,144, .9)';
        //        }
        //        //this.header_toolbar.style.backgroundColor = '';
        //        //-webkit-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
        //        //-moz-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
        //        this.header_toolbar.style.boxShadow = '';
        //
        //        //this.header_toolbar_menu_container.style.backgroundColor = 'rgba(144,144,144, .9)';
        //    } else if (!scroll_past_header) {
        //        scroll_past_header = true;
        //        //big_logo.style.opacity = 0;
        //        this.header_toolbar_menu_container.style.backgroundColor = 'rgba(144,144,144, 0)';
        //        this.header_toolbar_background.style.opacity = 1;
        //        this.logo_image_1.style.opacity = 1;
        //
        //        //this.header_toolbar.style.backgroundColor = 'rgba(144,144,144, .9)';
        //        //this.header_toolbar_menu_container.style.backgroundColor = 'transparent';
        //        //-webkit-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
        //        //-moz-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
        //        this.header_toolbar.style.boxShadow = '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4)';
        //    }
        //    //}
        //}
        //window.onscroll = scrollHandler;
    </script>
</header_toolbar>