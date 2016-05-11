/// <reference path="../../../../typediff/mytypes.d.ts" />
Polymer({
    is: 'is-terms_available',
    behaviors: [Polymer.NeonAnimationRunnerBehavior],
    properties: {
        terms: {
            type: Array,
            notify: true,
            observer: 'terms_changed'
        },
        terms_count: {
            type: Number,
            notify: true,
        },
        animationConfig: {
            value: function () {
                return {
                    'open': {
                        name: 'scale-up-animation',
                        node: this.$.filter,
                        transformOrigin: '0% 0%'
                    },
                    'close': {
                        name: 'scale-down-animation',
                        node: this.$.filter,
                        transformOrigin: '0% 0%'
                    }
                };
            }
        },
        _showing: {
            type: Boolean,
            value: false
        },
        text: {
            type: String,
            notify: true
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
            this.$.filter.style.visibility = 'hidden';
            this.$.term_container.style.zIndex = '-1';
        }
    },
    attached: function () {
    },
    created: function () {
    },
    move: function (from, to, array) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    },
    move_up: function (event) {
        var term = this.querySelector("#terms").indexForElement(event.target);
        if (term == 0) {
            this.move(0, this.terms.length - 1, this.terms);
        }
        else {
            this.move(term, term - 1, this.terms);
        }
        this.terms.map(function (value, index) {
            value.rank = index;
            return value;
        });
        this.terms = JSON.parse(JSON.stringify(this.terms));
    },
    move_down: function (event) {
        var term = this.querySelector("#terms").indexForElement(event.target);
        if (term == this.terms.length - 1) {
            this.move(term, 0, this.terms);
        }
        else {
            this.move(term, term + 1, this.terms);
        }
        this.terms.map(function (value, index) {
            value.rank = index;
            return value;
        });
        this.terms = JSON.parse(JSON.stringify(this.terms));
    },
    toggle: function (close) {
        this.$.filter.style.visibility = 'visible';
        this.$.term_container.style.zIndex = '1';
        if (this._showing) {
            this._showing = false;
            this.playAnimation('close');
        }
        else if (close !== true) {
            this._showing = true;
            this.playAnimation('open');
        }
    },
    remove_term: function (event) {
        var term = this.querySelector("#terms").indexForElement(event.target);
        this.terms[term].is_shown = false;
        this.terms = JSON.parse(JSON.stringify(this.terms));
    },
    add_term: function (event) {
        var term = this.querySelector("#terms").indexForElement(event.target);
        this.terms[term].is_shown = true;
        this.terms = JSON.parse(JSON.stringify(this.terms));
    }
});
