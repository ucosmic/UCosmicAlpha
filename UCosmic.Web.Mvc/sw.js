importScripts('/components/bower_components/sw-toolbox/sw-toolbox.js');

//self.addEventListener('message', function (event) {
//    console.log('good');
//    event.ports[0].postMessage({ 'test': 'This is my response.' });
//}); 

self.addEventListener('message', function (event) {
    //toolbox.uncache(url)

    var x = toolbox.uncache('/*');

    //x.next(function(){
    //    alert('test');
    //});
    //toolbox.uncache('*')
    toolbox.router.delete('*', toolbox.fastest);
    toolbox.router.delete('/*', toolbox.fastest);

    self.caches.keys().then(function (err) {
        console.log(err);
        err.forEach(function (cache) {
            self.caches.match(cache).then(function (test) {
                self.caches.delete(cache);
            })
        })
        //your cache is now deleted
    });
    //toolbox.uncache('/*', { origin: 'https://www.google.com' });


    //toolbox.uncache('/*', { origin: 'https://api.google.com' });

    //toolbox.uncache('/(.*)', { origin: 'https://www.google.com' });


    //toolbox.uncache('/(.*)', { origin: 'https://api.google.com' });


    //toolbox.uncache('/*', { origin: 'http://maps.googleapis.com' });

    //toolbox.uncache('/(.*)', { origin: 'http://maps.googleapis.com' });
});
//toolbox.options.debug = true;

//toolbox.precache(['/*']);

//toolbox.router.get('/*', toolbox.fastest);

//toolbox.router.get('/^https:\/\/www.google.com\/', toolbox.fastest);

toolbox.router.get('/*', toolbox.fastest);
toolbox.router.get('/*', toolbox.fastest, { origin: 'https://www.google.com' });


toolbox.router.get('/*', toolbox.fastest, { origin: 'https://api.google.com' });

toolbox.router.get('/(.*)', toolbox.fastest, { origin: 'https://www.google.com' });


toolbox.router.get('/(.*)', toolbox.fastest, { origin: 'https://api.google.com' });


toolbox.router.get('/*', toolbox.fastest, { origin: 'http://maps.googleapis.com' });

toolbox.router.get('/(.*)', toolbox.fastest, { origin: 'http://maps.googleapis.com' });


//toolbox.router.get('*/*', toolbox.fastest);


//toolbox.router.get('/^https:\/\/', toolbox.fastest);
//sw-precache 


//toolbox.router.get('/*', function (test) {
//    var x = test;
//});

//toolbox.router.get('/^https:\/\/www.google.com\/', function (test) {
//    var x = test;
//});

//toolbox.router.get('*', function (test) {
//    var x = test;
//}); 

//toolbox.router.get('*', function (test) {
//    var x = test; 
//    return x;
//}, { origin: 'https://www.google.com' });


//toolbox.router.get('*', function (test) {
//    var x = test;
//}, { origin: 'https://api.google.com' });


//toolbox.router.get('/^https:\/\/', function (test) {
//    var x = test;
//});