/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Boom = require('boom');
const Joi = require('joi');
const Lodash = require('lodash');


// Declare internals

const internals = {
    MODEL_NAME: 'clone'
};


exports.register = function (server, options, next) {

    const Model = Mongoose.model(internals.MODEL_NAME);

    server.route({
        method: 'GET',
        path: `/${internals.MODEL_NAME}`,
        handler: function (request, reply) {

            const level = request.query.level;

            Model.findOne({
                user: request.auth.credentials,
                level
            })
            .exec()
            .then((clone) => {

                if (!clone) {
                    throw new Boom.notFound();
                }

                clone = Lodash.pick(clone.toObject(), '_id', 'count');

                return reply({
                    clone
                });
            })
            .catch(Boom.notFound, () =>  reply(Boom.notFound()))
            .catch(Mongoose.Error, reply);
        },
        config: {
            tags: ['api', 'settings'],
            notes: 'Get app settings',
            validate: {
                query: {
                    level: Joi.string().required()
                }
            }
        }
    });

    next();
};


exports.register.attributes = {
    name: `api-${internals.MODEL_NAME}`
};

/* $lab:coverage:on$ */
