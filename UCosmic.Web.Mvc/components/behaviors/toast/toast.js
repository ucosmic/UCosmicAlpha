var toast = {
    toggle_toast_utility: function () {
        return {
            toggle_toast: function (value) {
                var _this = this;
                var toast = document.querySelector("#toast");
                if (toast.visible) {
                    setTimeout(function () {
                        _this.toggle_toast(value);
                    }, 100);
                }
                else {
                    toast.text = value.message;
                    toast.duration = value.duration;
                    toast.style.backgroundColor = value.color;
                    toast.toggle();
                }
            },
        };
    }
};
