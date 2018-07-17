/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Boom = require('boom');
const Lodash = require('lodash');


// Declare internals

const internals = {
    MODEL_NAME: 'list'
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
            tags: ['api', 'lists'],
            notes: 'Get all lists',
            pre: [{
                method: function (request, reply) {

                    const credentials = request.auth.credentials;
                    const referred = request.query.referred;

                    if (credentials.isAdmin && !referred) {
                        return reply({});
                    }

                    // Omit this query params
                    delete request.query.referred;

                    if (!referred) {
                        return reply({
                            users: {
                                $in: [credentials._id]
                            },
                            status: 'active'
                        });
                    }

                    // Check referred
                    const referredList = credentials.referredList;
                    const exists = referredList.find((r) => {

                        return Lodash.isEqual(`${r}`, `${referred}`);
                    });

                    if (!exists && !credentials.isAdmin) {
                        return reply(Boom.forbidden());
                    }

                    return reply({
                        users: {
                            $in: [referred]
                        },
                        status: 'active'
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
            tags: ['api', 'lists'],
            notes: 'Get one list by id',
            pre: [{
                method: function (request, reply) {

                    const credentials = request.auth.credentials;

                    if (credentials.isAdmin) {
                        return reply({});
                    }

                    return reply({
                        $or: [
                            {
                                users: {
                                    $in: [credentials._id]
                                }
                            },
                            {
                                users: {
                                    $in: credentials.referredList
                                }
                            }
                        ]
                    });
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
