/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');


// Declare internals

const internals = {
    MODEL_NAME: 'forgot-password'
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
            notes: 'Forgot password',
            auth: false
        }
    });

    next();
};


exports.register.attributes = {
    name: `api-${internals.MODEL_NAME}`
};

/* $lab:coverage:on$ */
