/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Boom = require('boom');
const Lodash = require('lodash');


// Declare internals

const internals = {
    MODEL_NAME: 'retirement'
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
                        createdBy: request.auth.credentials._id
                    });
                },
                assign: 'conditions',
                failAction: 'error'
            }],
            tags: ['api', 'retirements'],
            notes: 'Get all retirements'
        }
    });

    server.route({
        method: 'GET',
        path: `/${internals.MODEL_NAME}/{id}`,
        handler: {
            findOne: { Model }
        },
        config: {
            tags: ['api', 'retirements'],
            notes: 'Get one retirement by id',
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
            tags: ['api', 'retirements'],
            notes: 'Create new retirement',
            pre: [{
                method: function (request, reply) {

                    const payload = request.payload.data;

                    payload.status = 'pending';
                    payload.createdBy = request.auth.credentials;
                    payload.creator = request.auth.credentials;

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
            tags: ['api', 'retirements'],
            description: 'Update retirement by id',
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

                    const payload = Lodash.pick(request.payload.data,
                        'status', 'observations');

                    payload.updatedAt = new Date();
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
            tags: ['api', 'retirements'],
            description: 'Delete retirement by id',
            pre: [{
                method: function (request, reply) {

                    const credentials = request.auth.credentials;

                    if (credentials.isAdmin) {
                        return reply({
                            status: 'pending'
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
