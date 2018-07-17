/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Boom = require('boom');


// Declare internals

const internals = {
    MODEL_NAME: 'level'
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
            tags: ['api', 'levels'],
            notes: 'Get all list levels'
        }
    });

    server.route({
        method: 'GET',
        path: `/${internals.MODEL_NAME}/{id}`,
        handler: {
            findOne: { Model }
        },
        config: {
            tags: ['api', 'levels'],
            notes: 'Get one level by id',
            pre: [{
                method: function (request, reply) {

                    if (request.auth.credentials.isAdmin) {
                        return reply({});
                    }

                    return reply(Boom.forbidden());
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
            tags: ['api', 'levels'],
            notes: 'Create new level',
            pre: [{
                method: function (request, reply) {

                    if (request.auth.credentials.isAdmin) {
                        return reply({});
                    }

                    return reply(Boom.forbidden());
                },
                failAction: 'error'
            }, {
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

    server.route({
        method: 'PUT',
        path: `/${internals.MODEL_NAME}/{id}`,
        handler: {
            update: { Model }
        },
        config: {
            tags: ['api', 'levels'],
            description: 'Update level by id',
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

    server.route({
        method: 'DELETE',
        path: `/${internals.MODEL_NAME}/{id}`,
        handler: {
            delete: { Model }
        },
        config: {
            tags: ['api', 'levels'],
            description: 'Delete level by id',
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
