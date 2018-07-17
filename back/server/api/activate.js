/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Boom = require('boom');
const Joi = require('joi');
const Jwt = require('jsonwebtoken');
const Config = require('../../config');


// Declare internals

const internals = {};


exports.register = function (server, options, next) {

    const Model = Mongoose.model('user');

    server.route({
        method: 'GET',
        path: '/activate',
        handler: function (request, reply) {

            const token = request.query.token;

            Jwt.verify(token,
                Config.get('/authentication/activateUserToken'),
                (err, decoded) => {

                if (err || !decoded) {
                    return reply(Boom.forbidden());
                }

                Model
                .findByIdAndUpdate(decoded._id, {
                    $set: {
                        status: 'active'
                    }
                })
                .exec()
                .then(() => {

                    return reply.redirect(Config.get('/host/client'));
                })
                .catch(Mongoose.Error, reply);
            });
        },
        config: {
            auth: false,
            validate: {
                query: Joi.object({
                    token: Joi.string().required()
                })
            },
            tags: ['api', 'auth'],
            description: 'Validate and active user',
            notes: 'Validate and active user'
        }
    });

    next();
};


exports.register.attributes = {
    name: 'api-activate'
};

/* $lab:coverage:on$ */
