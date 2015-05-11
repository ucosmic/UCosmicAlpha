Polymer('is-side-filter', {
    has_space: true,
    is_full_screen: false,
    is_full_screenChanged: function (old_value, new_value) {
        if (new_value) {
            this.style.position = 'absolute';
        }
        else {
            this.style.position = 'relative';
        }
    },
    ready: function () {
        this.$.container.style.width = this.width;
        if (!this.has_space) {
            this.style.width = '';
            this.style.position = 'relative';
            this.style.right = '';
        }
    },
    toggle_menu: function (e) {
        var _this = this;
        if (this.$.container.style.display != 'none') {
            this.$.container.style.transformOrigin = "top right";
            this.shrink(this.$.container, 200);
            this.fadeOut(this.$.container, 200, function () {
                if (!_this.has_space) {
                    _this.style.width = '';
                    if (!_this.is_full_screen) {
                        _this.style.right = '';
                    }
                    else {
                        _this.style.right = '60px';
                    }
                    _this.$.menu_icon_shadow.style.left = '';
                }
                _this.$.menu_icon_shadow.style.visibility = "visible";
            });
        }
        else {
            if (!this.has_space) {
                this.style.width = '40px';
                if (!this.is_full_screen) {
                    this.style.position = 'relative';
                    this.style.right = (parseInt(this.width) - 40) + 'px';
                    this.$.menu_icon_shadow.style.left = (parseInt(this.width) - 40) + 'px';
                }
                else {
                    this.style.right = (parseInt(this.width) - 40 + 60) + 'px';
                    this.$.menu_icon_shadow.style.left = (parseInt(this.width) - 40 + 60) + 'px';
                }
            }
            this.fadeIn(this.$.container, 500);
            this.$.container.style.transformOrigin = "top right";
            this.grow(this.$.container, 500);
            this.$.menu_icon_shadow.style.visibility = "hidden";
        }
    }
});
