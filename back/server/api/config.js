/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Boom = require('boom');


// Declare internals

const internals = {
    MODEL_NAME: 'config'
};


exports.register = function (server, options, next) {

    const Model = Mongoose.model(internals.MODEL_NAME);

    server.route({
        method: 'GET',
        path: `/${internals.MODEL_NAME}/{id}`,
        handler: {
            findOne: { Model }
        },
        config: {
            tags: ['api', 'settings'],
            notes: 'Get app settings'
        }
    });

    server.route({
        method: 'PUT',
        path: `/${internals.MODEL_NAME}/{id}`,
        handler: {
            update: { Model }
        },
        config: {
            tags: ['api', 'settings'],
            description: 'Update app settings',
            pre: [{
                method: function (request, reply) {

                    const credentials = request.auth.credentials;

                    if (credentials.isAdmin) {
                        return reply({});
                    }

                    return reply(Boom.forbidden());
                },
                assign: 'conditions',
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
