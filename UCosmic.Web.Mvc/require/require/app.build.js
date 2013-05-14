({
    appDir: "../",
    baseUrl: "../Scripts/",
    dir: "../../scriptBuild",
    //Comment out the optimize line if you want
    //the code minified by UglifyJS
    optimize: "none",

    paths: {
        "jquery": "require/require-jquery.yui",
        "app": 'app',
        "compiled": 'compiled',
        "require": 'require',
        "jqueryui": 'lib/jqueryui',
        "lib": 'lib',
        "html": '../content/html'//,
//        "infuser": 'lib/infuser-amd',
//        "TrafficCop": 'lib/TrafficCop',
//        "ko": 'lib/knockout.min',
//        "koext": 'lib/knockout.ExternalTempateEngineAMD'
    },

    modules: [
        //Optimize the application files. jQuery is not 
        //included since it is already in require-jquery.js
        {
            name: "require/main",
            exclude: ["jquery"]
        }
    ]
})
