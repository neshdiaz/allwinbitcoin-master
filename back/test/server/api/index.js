// 'use strict';

// const Lab = require('lab');
// const Code = require('code');

// const lab = exports.lab = Lab.script();
// let request;
// let server;


// lab.beforeEach((done) => {

//     require('env2')('.env-test');

//     const Composer = require('../../../index');

//     Composer((err, _server) => {

//         if (err) {
//             return done(err);
//         }

//         server = _server;
//         server.start((error) => {

//             if (error) {
//                 return done(err);
//             }

//             done();
//         });
//     });
// });


// lab.experiment('Index Plugin', () => {

//     lab.beforeEach((done) => {

//         request = {
//             method: 'GET',
//             url: '/'
//         };

//         done();
//     });


//     lab.test('it returns the default message', (done) => {

//         server.inject(request, (response) => {

//             Code.expect(response.result.message).to.match(/welcome to the plot device/i);
//             Code.expect(response.statusCode).to.equal(200);

//             done();
//         });
//     });
// });
