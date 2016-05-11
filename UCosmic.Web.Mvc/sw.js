importScripts('/components/bower_components/sw-toolbox/sw-toolbox.js');

self.addEventListener('message', function (event) {
    console.log('good');
    event.ports[0].postMessage({ 'test': 'This is my response.' });
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