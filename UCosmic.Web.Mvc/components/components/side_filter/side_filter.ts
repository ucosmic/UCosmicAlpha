


Polymer('is-side-filter', {
    has_space: true,
    is_full_screen: false,
    //fadeOut: function (element, duration, callback = null) {
    //    element.style.display = "block";
    //    var animation = new Animation(element, [
    //        //{ opacity: "1.0", transform: "scale(1)" },
    //        //{ opacity: "0", transform: "scale(0)" },
    //        { opacity: "1.0" },
    //        { opacity: "0" },
    //    ], { duration: duration, fill: 'forwards' });
    //    var player = document.timeline.play(animation);
    //    player.addEventListener('finish', function () {
    //        element.style.display = "none";
    //        if (callback) {
    //            callback();
    //        }
    //    });
    //},
    //fadeIn: function (element, duration, callback = null) {
    //    element.style.display = "block";
    //    var animation = new Animation(element, [
    //        { opacity: "0" },
    //        { opacity: "1.0" },
    //        //{ opacity: "0", transform: "scale(0)" },
    //        //{ opacity: "1.0", transform: "scale(1)" },
    //    ], { duration: duration, fill: 'forwards' });
    //    //this.fadePlayer.play(animation);
    //    var player = document.timeline.play(animation);
    //    player.addEventListener('finish', function () {
    //        if (callback) {
    //            callback();
    //        }
    //    });

    //},
    //grow: function (element, duration, callback = null) {
    //    element.style.display = "block";
    //    var animation = new Animation(element, [
    //        { transform: "scale(0)" },
    //        { transform: "scale(1)" },
    //        //{ opacity: "0", transform: "scale(0)" },
    //        //{ opacity: "1.0", transform: "scale(1)" },
    //    ], { duration: duration, fill: 'forwards' });
    //    //this.fadePlayer.play(animation);
    //    var player = document.timeline.play(animation);
    //    player.addEventListener('finish', function () {
    //        if (callback) {
    //            callback();
    //        }
    //    });

    //},
    //shrink: function (element, duration, callback = null) {
    //    element.style.display = "block";
    //    var animation = new Animation(element, [
    //        { transform: "scale(1)" },
    //        { transform: "scale(0)" },
    //        //{ opacity: "0", transform: "scale(0)" },
    //        //{ opacity: "1.0", transform: "scale(1)" },
    //    ], { duration: duration, fill: 'forwards' });
    //    //this.fadePlayer.play(animation);
    //    var player = document.timeline.play(animation);
    //    player.addEventListener('finish', function () {
    //        if (callback) {
    //            callback();
    //        }
    //    });

    //},
    is_full_screenChanged: function (old_value, new_value) {
        if (new_value) {
            this.style.position = 'absolute';
        } else {
            this.style.position = 'relative';
        }
        //this.style.top = '25px';
        //this.style.right = '60px';
    },
    ready: function () {
        this.$.container.style.width = this.width;
        
        //this.style.top = '-55px';
        if (!this.has_space) {
            this.style.width = '';
            this.style.position = 'relative';
            this.style.right = '';
        }
        this.toggle_menu();
    },
    toggle_menu: function (e) {
        //this.fadeOut(this.$.menu_icon, 100);
        if (this.$.container.style.display != 'none') {
            this.$.container.style.transformOrigin = "top right"
            this.shrink(this.$.container, 200);
            this.fadeOut(this.$.container, 200,() => {
                if (!this.has_space) {
                    this.style.width = '';
                    if (!this.is_full_screen) {
                        //this.style.position = '';
                        this.style.right = '';
                    }else{
                        this.style.right = '60px';
                    }
                    this.$.menu_icon_shadow.style.left = '';
                }
                this.$.menu_icon_shadow.style.visibility = "visible";
            });
        } else {
            if (!this.has_space) {
                this.style.width = '40px';//40 is width of icon
                if (!this.is_full_screen) {
                    this.style.position = 'relative';
                    this.style.right = (parseInt(this.width) - 40) + 'px';
                    this.$.menu_icon_shadow.style.left = (parseInt(this.width) - 40) + 'px';
                } else {
                    this.style.right = (parseInt(this.width) - 40 + 60) + 'px';
                    this.$.menu_icon_shadow.style.left = (parseInt(this.width) - 40 + 60) + 'px';
                }
            }
            this.fadeIn(this.$.container, 500);
            this.$.container.style.transformOrigin = "top right"
            this.grow(this.$.container, 500);
            this.$.menu_icon_shadow.style.visibility = "hidden";
        }
        //this.$.container.style.display = 'block';
    }
}); 