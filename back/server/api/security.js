/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Boom = require('boom');


// Declare internals

const internals = {
    MODEL_NAME: 'security'
};


exports.register = function (server, options, next) {

    const Model = Mongoose.model(internals.MODEL_NAME);

    server.route({
        method: 'POST',
        path: `/${internals.MODEL_NAME}`,
        handler: {
            create: { Model, reload: false }
        },
        config: {
            tags: ['api', 'security'],
            notes: 'Create new security token',
            pre: [{
                method: function (request, reply) {

                    const payload = request.payload.data;

                    payload.createdBy = request.auth.credentials;

                    return reply(payload);
                },
                assign: 'payload',
                failAction: 'error'
            }]
        }
    });

    next();
};


exports.register.attributes = {
    name: `api-${internals.MODEL_NAME}`
};

/* $lab:coverage:on$ */
