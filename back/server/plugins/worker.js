/* $lab:coverage:off$ */

'use strict';

// Load modules

const Hoek = require('hoek');
const Queue = require('bee-queue');
const Mongoose = require('mongoose');


// Declare internals

const internals = {};


exports.register = function (server, options, next) {

    const queue = Queue('joins');

    queue.on('ready', function () {

        const Join = Mongoose.model('join');

        /** Handle join requests */
        queue.process(function (job, done) {

            server.log('queue', `process job ${job.id}`);

            let data = job.data;

            Join
            .findById(data._id)
            .populate('level user')
            .exec()
            .then((join) => {

                Hoek.assert(join, `Join (${data._id}) was
                                   intentionally deleted
                                   from outside the system. Job
                                   id: ${job.id}`);

                // Update progress
                job.reportProgress(10);

                return join
                .applyBussinessLogicTofindList(job);
            })
            .then(() => {

                done();
                return null;
            })
            .catch((err) => {

                server.log('error', err);
                done(err);
                return null;
            });
        });

        next();
    });
};


exports.register.attributes = {
    name: 'worker',
    dependencies: ['model-join']
};

/* $lab:coverage:on$ */