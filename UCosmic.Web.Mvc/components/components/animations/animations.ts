 
Polymer('is-animations', { 
    fadeOut: function (element, duration, callback = null) {
        element.style.display = "block";
        var animation = new Animation(element, [
            //{ opacity: "1.0", transform: "scale(1)" },
            //{ opacity: "0", transform: "scale(0)" },
            { opacity: "1.0" },
            { opacity: "0" },
        ], { duration: duration, fill: 'forwards' });
        var player = document.timeline.play(animation);
        player.addEventListener('finish', function () {
            element.style.display = "none";
            if (callback) {
                callback();
            }
        });
    },
    fadeIn: function (element, duration, callback = null) {
        element.style.display = "block";
        var animation = new Animation(element, [
            { opacity: "0" },
            { opacity: "1.0" },
            //{ opacity: "0", transform: "scale(0)" },
            //{ opacity: "1.0", transform: "scale(1)" },
        ], { duration: duration, fill: 'forwards' });
        //this.fadePlayer.play(animation);
        var player = document.timeline.play(animation);
        player.addEventListener('finish', function () {
            if (callback) {
                callback();
            }
        });

    },
    grow: function (element, duration, callback = null) {
        element.style.display = "block";
        var animation = new Animation(element, [
            { transform: "scale(0)" },
            { transform: "scale(1)" },
            //{ opacity: "0", transform: "scale(0)" },
            //{ opacity: "1.0", transform: "scale(1)" },
        ], { duration: duration, fill: 'forwards' });
        //this.fadePlayer.play(animation);
        var player = document.timeline.play(animation);
        player.addEventListener('finish', function () {
            if (callback) {
                callback();
            }
        });

    },
    shrink: function (element, duration, callback = null) {
        element.style.display = "block";
        var animation = new Animation(element, [
            { transform: "scale(1)" },
            { transform: "scale(0)" },
            //{ opacity: "0", transform: "scale(0)" },
            //{ opacity: "1.0", transform: "scale(1)" },
        ], { duration: duration, fill: 'forwards' });
        //this.fadePlayer.play(animation);
        var player = document.timeline.play(animation);
        player.addEventListener('finish', function () {
            if (callback) {
                callback();
            }
        });

    },
    
}); 