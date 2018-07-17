/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');


// Declare internals

const internals = {
    MODEL_NAME: 'account'
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
            pre: [{
                method: function method(request, reply) {

                    if (request.auth.credentials.isAdmin) {
                        return reply({});
                    }

                    return reply({
                        user: request.auth.credentials._id
                    });
                },
                assign: 'conditions',
                failAction: 'error'
            }],
            tags: ['api', 'accounts'],
            notes: 'Get all acounts'
        }
    });

    next();
};


exports.register.attributes = {
    name: `api-${internals.MODEL_NAME}`
};

/* $lab:coverage:on$ */
