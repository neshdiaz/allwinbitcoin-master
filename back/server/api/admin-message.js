/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Boom = require('boom');
const Lodash = require('lodash');


// Declare internals

const internals = {
    MODEL_NAME: 'admin-message'
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
            tags: ['api', 'admin-message'],
            notes: 'Get all admin messages',
            pre: [{
                method: function (request, reply) {

                    if (request.auth.credentials.isAdmin) {
                        return reply({});
                    }

                    return reply({
                        status: 'm_active'
                    });
                },
                assign: 'conditions',
                failAction: 'error'
            }]
        }
    });

    server.route({
        method: 'GET',
        path: `/${internals.MODEL_NAME}/{id}`,
        handler: {
            findOne: { Model }
        },
        config: {
            tags: ['api', 'admin-message'],
            notes: 'Get one record by id',
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
            tags: ['api', 'admin-message'],
            notes: 'Create new admin message',
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
            tags: ['api', 'admin-message'],
            description: 'Update list by id',
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
            }, {
                method: function (request, reply) {

                    let payload = request.payload.data;

                    payload.updatedBy = request.auth.credentials;

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
            tags: ['api', 'admin-message'],
            description: 'Delete admin message by id',
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
