

var toast = {
    toggle_toast_utility: function () {
        return {
            toggle_toast: function (value) {
                //assumes a toast with id toast
                var toast: any = document.querySelector("#toast");
                if(toast.visible){
                    setTimeout(() => {
                        this.toggle_toast(value);
                    }, 100)
                }else{
                    toast.text = value.message;
                    toast.duration = value.duration;
                    toast.style.backgroundColor = value.color;
                    toast.toggle();
                }
            },
        };
    }
};




