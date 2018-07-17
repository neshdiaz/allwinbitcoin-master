/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Boom = require('boom');
const Lodash = require('lodash');


// Declare internals

const internals = {
    MODEL_NAME: 'admin-list'
};


exports.register = function (server, options, next) {

    const Model = Mongoose.model(internals.MODEL_NAME);
    const List = Mongoose.model('list');

    server.route({
        method: 'GET',
        path: `/${internals.MODEL_NAME}`,
        handler: {
            find: { Model: List, modelName: internals.MODEL_NAME }
        },
        config: {
            tags: ['api', 'admin-list'],
            notes: 'Get all lists for admin',
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
        method: 'GET',
        path: `/${internals.MODEL_NAME}/{id}`,
        handler: {
            findOne: { Model: List, modelName: internals.MODEL_NAME }
        },
        config: {
            tags: ['api', 'admin-list'],
            notes: 'Get one list by id',
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
            tags: ['api', 'admin-list'],
            notes: 'Create new list for admin',
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

                    payload.status = 'inactive';
                    payload.createdBy = request.auth.credentials;
                    payload.blocked = false;
                    payload.fromAdmin = true;

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
            update: { Model: List }
        },
        config: {
            tags: ['api', 'admin-list'],
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

                    payload = Lodash.pick(payload, 'status');

                    if (payload.status === 'closed') {
                        payload.splitDate = new Date();
                    }

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
            delete: { Model: List }
        },
        config: {
            tags: ['api', 'admin-list'],
            description: 'Delete list by id',
            pre: [{
                method: function (request, reply) {

                    const credentials = request.auth.credentials;

                    if (credentials.isAdmin) {
                        return reply({
                            status: 'inactive',
                            fromAdmin: true
                        });
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
