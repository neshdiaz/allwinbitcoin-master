/* $lab:coverage:off$ */

'use strict';

// Load modules

const Hoek = require('hoek');
const Queue = require('bee-queue');


// Declare internals

const internals = {};


exports.register = function (server, options, next) {

    const queue = Queue('joins');

    server.expose('createJob', (join, callback) => {

        let job = queue.createJob({ _id: join.id });
        job.save((err) => {

            if (err) {
                server.log('queue', err);
            }

            server.log('queue', `create new job ${job.id}`);
            callback();
        });
    });

    next();
};


exports.register.attributes = {
    name: 'join',
    dependencies: ['model-join', 'model-list']
};

/* $lab:coverage:on$ */