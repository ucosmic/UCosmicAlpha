/// <reference path="../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../typediff/mytypes.d.ts" />


Polymer({
    is: "is-filter",

    behaviors: [Polymer.NeonAnimationRunnerBehavior],
    properties: {

        nav_list: {
            type: Object,
            notify: true,
            //observer: 'nav_list_changed'
        }
        ,animationConfig: {
            value: function() {
                return {
                    'open': {
                        // provided by neon-animation/animations/scale-up-animation.html
                        name: 'scale-up-animation',
                        node: this.$.filter
                        ,transformOrigin: '100% 0%'// + (this.$.filter.clientWidth - 20)
                    },
                    'close': {
                        // provided by neon-animation-animations/fade-out-animation.html
                        name: 'scale-down-animation',
                        node: this.$.filter
                        ,transformOrigin: '100% 0%'
                    }
                }
            }
        }
        , _showing: {
            type: Boolean,
            value: false
        }
        , filter_closed: {
            type: Boolean,
            value: false
            , notify: true
        }
    },

    listeners: {
        'neon-animation-finish': '_onAnimationFinish'
    },
    is_login: "",

    _onAnimationFinish: function() {
        if (this._showing) {
            //this.$.filter.style.transform = 'scale(100,100)';
        } else {
            this.$.filter.style.visibility = 'hidden';
            this.$.filter_container.style.zIndex = '-1';
        }
    },

    attached: function () {
        //this.$.filter.style.display = 'none';
        //this.$.filter.style.width = 0;
        //this.$.filter.style.transform = 'scale(0,0)';
        //this.$.filter.style.overflow = 'hidden';
        //this.toggle_nav();
    },
    change_page: function(){
      this.toggle_nav();
    },
    created: function () {
    },
    toggle: function(){
        //this.$.filter.style.right = (this.$.filter.clientWidth - 20) + 'px';
        this.$.filter.style.visibility = 'visible';
        this.$.filter_container.style.zIndex = '1';
        //this._showing = true;
        //var close_menu = (event) => {
        //    this.toggle_nav();
        //}
        if (this._showing) {
            //document.body.removeEventListener('click',
            //    close_menu,false);
            this._showing = false;
            this.playAnimation('close');
            this.filter_closed = true;
        } else {
            //document.body.addEventListener('click',
            //    close_menu,false);
            this._showing = true;
            this.playAnimation('open');
            this.filter_closed = false;
        }
    }
    //nav_list_changed:function (new_value, old_value) {
    //    setTimeout(() =>{
    //
    //        this.$.filter.right = (this.$.filter.clientWidth - 20) + 'px';
    //    }, 100);
    //}
});