/* $lab:coverage:off$ */

'use strict';

// Load modules

const Hoek = require('hoek');
const Queue = require('bee-queue');
const Mongoose = require('mongoose');


// Declare internals

const internals = {};


exports.register = function (server, options, next) {

    const Transfer = Mongoose.model('transfer');
    const queue = new Queue('transfers', {
        removeOnSuccess: true
    });
    const methods = {
        /**
         * Start new job.
         *
         * @param {*Mongoose.document} join
         * @param {*Function} callback
         */
        createJob(transfer, callback) {

            let job = queue.createJob(transfer);
            job.retries(2).save(callback);

            job.on('progress', function (progress) {

                Transfer
                .findByIdAndUpdate(job.data._id, { $set: { progress } })
                .exec();
                server.log('queue',
                  `Job for transfer ${job.id} reported progress: ${progress}'`);
            });
        },

        /**
         * To process a job related to new transfer.
         *
         * @param {*bew-queue Job} job
         * @param {*Function} done
         */
        process(job, done) {

            Transfer
            .findById(job.data._id)
            .exec()
            .then((transfer) => {

                Hoek.assert(transfer, `Transfer (${job.data._id}) was intentionally deleted
                                    from outside the system. Job id: ${job.id}`);

                // Update progress
                job.reportProgress(10);

                return transfer
                .process(job);
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
        }
    };

    server.expose(methods);

    queue.on('ready', function () {

        /** Handle join requests */
        queue.process(function (job, done) {

            let data = job.data;

            job.reportProgress(1);
            methods.process(job, done);
        });

        next();
    });
};


exports.register.attributes = {
    name: 'transfer',
    dependencies: ['model-transfer']
};

/* $lab:coverage:on$ */