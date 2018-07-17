/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');


// Declare internals

const internals = {};


exports.register = function (server, options, next) {

    // Capture ember errors
    server.ext({
        type: 'onPostHandler',
        method: function (request, reply) {

            const response = request.response;

            if (response instanceof Mongoose.Error.ValidationError) {
                return reply(internals.parseValidationError(response)).code(422);
            }

            return reply.continue();
        }
    });

    return next();
};


/**
* Parse Mongoose ValidationError to Ember DS.Errors
* @see http://emberjs.com/api/data/classes/DS.Errors.html
*/
internals.parseValidationError = function (err) {

    const error = {
        errors: []
    };

    for (const key in err.errors) {
        const validatorError = err.errors[key];
        error.errors.push({
            status: '422',
            source: {
                pointer: 'data/attributes/' + validatorError.path
            },
            title: validatorError.toString(),
            detail: validatorError.toString()
        });
    };

    return error;
};


exports.register.attributes = {
    name: 'decorators'
};

/* $lab:coverage:on$ */