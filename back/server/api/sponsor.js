/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Boom = require('boom');
const Joi = require('joi');


// Declare internals

const internals = {
    MODEL_NAME: 'user'
};


exports.register = function (server, options, next) {

    const Model = Mongoose.model(internals.MODEL_NAME);
    const ObjectId = Mongoose.Types.ObjectId;

    server.route({
        method: 'GET',
        path: '/sponsor/{id}',
        handler: function (request, reply) {

            const query = Model.findOne({
                $or: [{
                    email: request.params.id
                }, {
                    username: request.params.id
                }]
            });

            query
            .exec()
            .then((doc) => {

                reply(!doc ? Boom.notFound() : {
                    sponsor: {
                        _id: doc.id,
                        username: doc.username,
                        email: doc.email
                    }
                });
            })
            .catch(reply);
        },
        config: {
            validate: {
                params: {
                    id: Joi.string()
                }
            },
            auth: false,
            tags: ['api', 'sponsors'],
            notes: 'Find sponsor by id'
        }
    });

    next();
};


exports.register.attributes = {
    name: 'api-sponsor'
};

/* $lab:coverage:on$ */
