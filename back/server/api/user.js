/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Boom = require('boom');
const Lodash = require('lodash');


// Declare internals

const internals = {
    MODEL_NAME: 'user'
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

                    const credentials = request.auth.credentials;

                    if (credentials.isAdmin) {
                        return reply({});
                    }

                    return reply({
                        _id: {
                            $in: credentials.referredList
                        }
                    });
                },
                assign: 'conditions',
                failAction: 'error'
            }],
            tags: ['api', 'users'],
            notes: 'Get all users '
        }
    });

    server.route({
        method: 'GET',
        path: `/${internals.MODEL_NAME}/{id}`,
        handler: {
            findOne: { Model }
        },
        config: {
            pre: [{
                method: function method(request, reply) {

                    if (request.auth.credentials.isAdmin) {
                        return reply({});
                    }

                    reply({
                        $and: [
                            {
                                _id: request.auth.credentials._id
                            }
                        ]
                    });
                },
                assign: 'conditions',
                failAction: 'error'
            }],
            tags: ['api', 'users'],
            notes: 'Get one user by id'
        }
    });

    server.route({
        method: 'POST',
        path: `/${internals.MODEL_NAME}`,
        handler: {
            create: { Model }
        },
        config: {
            auth: {
                mode: 'try'
            },
            pre: [{
                method: function (request, reply) {

                    if (request.auth.isAuthenticated) {
                        if (request.auth.credentials.isAdmin) {
                            return reply({});
                        }

                        return reply(Boom.forbidden());
                    }

                    return reply({});
                },
                assign: 'conditions',
                failAction: 'error'
            }, {
                method: function (request, reply) {

                    const payload = request.payload.data;

                    payload.status = 'inactive';
                    payload.special = false;
                    payload.super = false;
                    payload.isAdmin = false;
                    payload.language = 'es';

                    if (request.auth.isAuthenticated) {
                        payload.createdBy = request.auth.credentials;
                    }

                    return reply(payload);
                },
                assign: 'payload',
                failAction: 'error'
            }],
            tags: ['api', 'users'],
            notes: 'Create one user'
        }
    });

    server.route({
        method: 'PUT',
        path: `/${internals.MODEL_NAME}/{id}`,
        handler: {
            update: { Model }
        },
        config: {
            tags: ['api', 'users'],
            description: 'Update user by id',
            pre: [{
                method: function (request, reply) {

                    const credentials = request.auth.credentials;

                    if (credentials.isAdmin) {
                        return reply({});
                    }

                    return reply({ _id: credentials._id });
                },
                assign: 'conditions',
                failAction: 'error'
            }, {
                method: function (request, reply) {

                    const credentials = request.auth.credentials;
                    let payload = request.payload.data;

                    if (credentials.isAdmin) {
                        payload = Lodash.omit(payload,
                                    'password', 'passwordConfirmation', 'secondKey',
                                    'country', 'language', 'btcAddress');
                        return reply(payload);
                    }

                    payload = Lodash.pick(payload,
                        'name', 'phone', 'country',
                        'city', 'language', 'btcAddress');

                    return reply(payload);
                },
                assign: 'payload',
                failAction: 'error'
            }]
        }
    });

    server.route({
        method: 'DELETE',
        path: `/${internals.MODEL_NAME}/{id}`,
        handler: {
            delete: { Model }
        },
        config: {
            tags: ['api', 'users'],
            description: 'Delete user by id',
            pre: [{
                method: function (request, reply) {

                    let credentials = request.auth.credentials;

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
