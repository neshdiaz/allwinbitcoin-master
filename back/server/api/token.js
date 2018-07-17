/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Joi = require('joi');
const Hoek = require('hoek');
const Jwt = require('jsonwebtoken');


// Declare internals

const internals = {
    INVALID_GRANT: {
        error: 'error_invalid_token'
    },
    USER_LOCKED: {
        error: 'error_user_locked'
    },
    USER_INACTIVE: {
        error: 'error_user_inactive'
    },
    HTTP_STATUS: 400
};


exports.register = function (server, options, next) {

    const refreshSecret = options.refreshSecret;
    const secret = options.secret;
    const expiresIn = options.expiresIn;
    const Model = Mongoose.model('user');

    server.route({
        method: 'POST',
        path: '/token',
        handler: function (request, reply) {

            const payload = Hoek.clone(request.payload);
            const issueTokens = function (doc) {

                const _options = { expiresIn };
                const token = Jwt.sign({ doc }, secret, _options);
                const refreshToken = Jwt.sign({ doc }, refreshSecret, _options);

                return reply({
                    access_token: token,
                    user_id: doc._id,
                    expires_in: expiresIn,
                    refresh_token: refreshToken,
                    role: doc.role
                });
            };

            if (payload.grant_type === 'password') {
                Model
                .findOne({
                    $or: [{
                        email: payload.username
                    }, {
                        username: payload.username
                    }]
                })
                .exec()
                .then((user) => {

                    if (!user) {
                        return reply(internals.INVALID_GRANT)
                                .code(internals.HTTP_STATUS);
                    }

                    if (!user.isAdmin && user.isLocked) {
                        return reply(internals.USER_LOCKED)
                                .code(internals.HTTP_STATUS);
                    }

                    if (!user.isAdmin && user.isInactive) {
                        return reply(internals.USER_INACTIVE)
                                .code(internals.HTTP_STATUS);
                    }

                    user.comparePassword(payload.password, (err, isMatch) => {

                        if (err || !isMatch) {
                            return reply(internals.INVALID_GRANT)
                                    .code(internals.HTTP_STATUS);
                        }

                        return issueTokens({
                            _id: user.id,
                            role: user.role
                        });
                    });

                    return null;
                })
                .catch(reply);
            }
            else {
                Jwt.verify(payload.refresh_token, refreshSecret, (err, decoded) => {

                    if (err) {
                        return reply(internals.INVALID_GRANT)
                                    .code(internals.HTTP_STATUS);
                    }

                    return issueTokens(decoded.doc);
                });
            }
        },
        config: {
            auth: {
                mode: 'try',
                strategies: [options.strategyName]
            },
            validate: {
                payload: Joi.object({
                    grant_type: Joi.string().valid('refresh_token', 'password'),
                    username: Joi.string().when('grant_type', {
                        is: 'password',
                        then: Joi.required()
                    }),
                    password: Joi.string().when('grant_type', {
                        is: 'password',
                        then: Joi.required()
                    }),
                    refresh_token: Joi.string().when('grant_type', {
                        is: 'refresh_token',
                        then: Joi.required()
                    }),
                    scope: Joi.string().optional()
                })
            },
            tags: ['api', 'auth'],
            description: 'Get authentication token',
            notes: 'Get authentication token'
        }
    });

    server.route({
        method: 'POST',
        path: '/revoke',
        handler: function (request, reply) {

            return reply({});
        },
        config: {
            auth: {
                mode: 'try',
                strategies: [options.strategyName]
            },
            tags: ['api', 'auth'],
            description: 'Revoke authentication token',
            notes: 'Revoke authentication token'
        }
    });

    next();
};


exports.register.attributes = {
    name: 'api-token'
};

/* $lab:coverage:on$ */
