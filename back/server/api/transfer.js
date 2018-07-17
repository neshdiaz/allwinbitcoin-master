/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');


// Declare internals

const internals = {
    MODEL_NAME: 'transfer'
};


exports.register = function (server, options, next) {

    const Model = Mongoose.model(internals.MODEL_NAME);

    server.route({
        method: 'GET',
        path: `/${internals.MODEL_NAME}`,
        handler: {
            find: { Model }
        },
        config: {
            tags: ['api', 'transfers'],
            notes: 'Get all transfers',
            pre: [{
                method: function (request, reply) {

                    if (request.auth.credentials.isAdmin) {
                        return reply({});
                    }

                    return reply({
                        internal: false,
                        createdBy: request.auth.credentials._id
                    });
                },
                assign: 'conditions',
                failAction: 'error'
            }]
        }
    });

    server.route({
        method: 'POST',
        path: `/${internals.MODEL_NAME}`,
        handler: {
            create: { Model }
        },
        config: {
            tags: ['api', 'transfers'],
            notes: 'Create new transfer',
            pre: [{
                method: function (request, reply) {

                    const payload = request.payload.data;

                    payload.internal = false;
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
