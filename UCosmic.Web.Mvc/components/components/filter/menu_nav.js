/// <reference path="../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../typediff/mytypes.d.ts" />
Polymer({
    is: "is-menu_nav",
    behaviors: [Polymer.NeonAnimationRunnerBehavior],
    properties: {
        nav_list: {
            type: Object,
            notify: true,
        },
        animationConfig: {
            value: function () {
                return {
                    'open': {
                        // provided by neon-animation/animations/scale-up-animation.html
                        name: 'scale-up-animation',
                        node: this.$.menu_nav,
                        transformOrigin: '100% 0%' // + (this.$.menu_nav.clientWidth - 20)
                    },
                    'close': {
                        // provided by neon-animation-animations/fade-out-animation.html
                        name: 'scale-down-animation',
                        node: this.$.menu_nav,
                        transformOrigin: '100% 0%'
                    }
                };
            }
        },
        _showing: {
            type: Boolean,
            value: false
        }
    },
    listeners: {
        'neon-animation-finish': '_onAnimationFinish'
    },
    is_login: "",
    _onAnimationFinish: function () {
        if (this._showing) {
        }
        else {
            this.$.menu_nav.style.visibility = 'hidden';
        }
    },
    attached: function () {
        //this.$.menu_nav.style.display = 'none';
        //this.$.menu_nav.style.width = 0;
        //this.$.menu_nav.style.transform = 'scale(0,0)';
        //this.$.menu_nav.style.overflow = 'hidden';
        //this.toggle_nav();
    },
    change_page: function () {
        this.toggle_nav();
    },
    created: function () {
    },
    toggle_nav: function () {
        this.$.menu_nav.style.right = (this.$.menu_nav.clientWidth - 20) + 'px';
        this.$.menu_nav.style.visibility = 'visible';
        //this._showing = true;
        //var close_menu = (event) => {
        //    this.toggle_nav();
        //}
        if (this._showing) {
            //document.body.removeEventListener('click',
            //    close_menu,false);
            this._showing = false;
            this.playAnimation('close');
        }
        else {
            //document.body.addEventListener('click',
            //    close_menu,false);
            this._showing = true;
            this.playAnimation('open');
        }
    }
});
