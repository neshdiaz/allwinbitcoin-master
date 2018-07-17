/* $lab:coverage:off$ */

'use strict';

// Load modules

const Lodash = require('lodash');
const Boom = require('boom');
const Joi = require('joi');
const Hoek = require('hoek');
const Mongoose = require('mongoose');
const Async = require('async');


// Declare internals

const internals = {
    queryToOmit: ['limit', 'page', 'sort', 'sortDir', 'all', 'search', 'select',
        'populate', 'EIO', 'transport', 't', 'Authorization']
};


internals.find = function (route, options) {

    return function (request, reply) {

        const Model = options.Model || Mongoose.model(request.params.model);
        Hoek.assert(Model, `Model not found on route ${route.path}`);

        const Q = request.pre.Q || Model.find(options.conditions ||
            request.pre.conditions || {});

        if (request.pre.select) {
            Q.select(request.pre.select);
        }

        const query = request.query || {};
        const limit = parseInt(query.limit || options.limit || 20);
        const page = parseInt(query.page || 1);
        const modelName = options.modelName || `${Model.modelName}`;

        if (query.sort) {
            Q.sort(`${query.sortDir === 'desc' ? '-' : ''}${query.sort}`);
        }

        if (!query.all) {
            Q.skip((page) * limit - limit);
            Q.limit(limit);
        }

        if (query.select) {
            Q.select(query.select);
        }

        const and = [];
        const filters = Lodash.omit(query, internals.queryToOmit);

        Lodash.each(filters, (value, key) => {

            if (Lodash.isEmpty(value) && !Lodash.isDate(value)) {
                return;
            }

            and.push(Lodash.zipObject([key], [value]));
        });

        if (and.length) {
            Q.and(and);
        }

        if (query.search) {
            const regExp = new RegExp(query.search, 'gi');
            const searchIsNum = !isNaN(Lodash.toNumber(query.search));
            const schema = Q.model.schema;
            const searchOr = [];

            schema.eachPath((key, path) => {

                if (path.instance === 'Number' && searchIsNum) {
                    searchOr.push(Lodash.zipObject([key], [query.search]));
                }
                else if (path.instance === 'String' && !path.options.nosearch) {
                    searchOr.push(Lodash.zipObject([key], [regExp]));
                }
            });

            if (searchOr.length) {
                Q.and({ $or: searchOr });
            }
        }

        const or = request.pre.or || [];

        if (or.length) {
            or.forEach((conds) => Q.and({ $or: conds }));
        }

        Async.parallel({
            count: (next) => {

                Model.count(Q._conditions)
                .exec()
                .then((total) => next(null, total))
                .catch(next);
            },
            docs: (next) => {

                Q.exec()
                .then((docs) => next(null, docs))
                .catch(next);
            }
        }, (err, data) => {

            const pages = Math.ceil(data.count / limit) || 1;
            const meta = {
                pages,
                total: data.count || 0,
                haveMoreRecords: query.all ? false : page < pages
            };

            return reply(err, {
                [modelName]: data.docs,
                meta
            });
        });
    };
};


internals.find.defaults = {
    validate: {
        query: Joi.object({
            all: Joi.boolean().default(false).description('true for get all records'),
            sort: Joi.string().empty('').description('sort field'),
            limit: Joi.number().description('limit of records'),
            page: Joi.number().default(1).description('number of page'),
            sortDir: Joi.string().empty('').description('"asc" or "desc"'),
            search: Joi.string().empty('').description('any keyword for search'),
            select: Joi.string().empty('').description('fields to select'),
            populate: [Joi.array(), Joi.string()],
            EIO: Joi.any().optional(),
            transport: Joi.any().optional(),
            t: Joi.any().optional(),
            Authorization: Joi.any().optional()
        }).unknown(),
        params: {
            model: Joi.string().optional().description('optional model name (don\'t use)')
        }
    },
    tags: ['api']
};


internals.findOne = function (route, options) {

    return function (request, reply) {

        const Model = options.Model || Mongoose.model(request.params.model);
        Hoek.assert(Model, `Model not found on route ${route.path}`);

        const query = Lodash.omit(request.query, internals.queryToOmit);
        const modelName = options.modelName || `${Model.modelName}`;
        const conditions = Hoek.applyToDefaults({
            _id: request.params.id
        }, (request.pre.conditions || query || {}));

        Model.findOne(conditions)
        .exec().then((doc) => {

            if (!doc) {
                return reply(Boom.notFound());
            }

            return reply({
                [modelName]: doc
            });
        }).catch(reply);
    };
};


internals.findOne.defaults = {
    validate: {
        params: {
            id: Joi.string().required(),
            model: Joi.string().optional().description('optional model name (don\'t use)')
        },
        query: {
            EIO: Joi.any().optional(),
            transport: Joi.any().optional(),
            t: Joi.any().optional(),
            Authorization: Joi.any().optional()
        }
    },
    tags: ['api']
};


internals.create = function (route, options) {

    return function (request, reply) {

        const Model = options.Model || Mongoose.model(request.params.model);
        Hoek.assert(Model, `Model not found on route ${route.path}`);

        const mobile = request.query.scope === 'mobile';
        const modelName = options.modelName || `${Model.modelName}`;
        const payload = request.pre.payload || request.payload.data;
        const reload = typeof options.reload === 'undefined' ? true : options.reload;

        Model
        .create(payload)
        .then((doc) => {

            if (reload) {
                return Model
                .findById(doc.id)
                .exec();
            }
            else {
                return {
                    _id: doc.id
                };
            }
        })
        .then((doc) => {

            reply({
                [modelName]: doc
            }).code(201);

            return null;
        })
        .catch(reply);
    };
};


internals.create.defaults = {
    validate: {
        params: {
            model: Joi.string().optional().description('optional model name')
        },
        payload: Joi.object({
            data: Joi.object().required()
        }).meta({ className: 'payload' }),
        query: {
            scope: Joi.string().optional()
        }
    },
    tags: ['api']
};


internals.update = function (route, options) {

    return function (request, reply) {

        const Model = options.Model || Mongoose.model(request.params.model);
        Hoek.assert(Model, `Model not found on route ${route.path}`);

        const mobile = request.query.scope === 'mobile';
        const modelName = options.modelName || `${Model.modelName}`;
        const conditions = Hoek.applyToDefaults({
            _id: request.params.id
        }, (request.pre.conditions || request.query || {}));

        Model.findOne(conditions)
        .exec().then((doc) => {

            if (!doc) {
                return reply(Boom.notFound());
            }

            doc.set(request.pre.payload || request.payload.data);
            doc.save()
            .then(() => {

                return reply({
                    [modelName]: mobile ? doc : { _id: doc.id }
                }).code(200);
            })
            .catch(reply);
        })
        .catch(reply);
    };
};


internals.update.defaults = {
    validate: {
        params: {
            id: Joi.string().required(),
            model: Joi.string().optional().description('optional model name (don\'t use)')
        },
        payload: Joi.object({
            data: Joi.object().required()
        }).meta({ className: 'payload' }),
        query: {
            scope: Joi.string().optional()
        }
    },
    tags: ['api']
};


internals.delete = function (route, options) {

    return function (request, reply) {

        const Model = options.Model || Mongoose.model(request.params.model);
        Hoek.assert(Model, `Model not found on route ${route.path}`);

        const conditions = Hoek.applyToDefaults({
            _id: request.params.id
        }, (request.pre.conditions || request.query || {}));

        Model.findOne(conditions)
        .exec().then((doc) => {

            if (!doc) {
                return reply(Boom.notFound());
            }

            doc.remove()
            .then(() => reply({}))
            .catch(reply);
        })
        .catch(reply);
    };
};


internals.delete.defaults = {
    validate: {
        params: {
            id: Joi.string().required(),
            model: Joi.string().optional().description('optional model name (don\'t use)')
        }
    },
    tags: ['api']
};


exports.register = function handlers(server, options, next) {

    server.handler('find', internals.find);
    server.handler('findOne', internals.findOne);
    server.handler('update', internals.update);
    server.handler('create', internals.create);
    server.handler('delete', internals.delete);

    next();
};


exports.register.attributes = {
    name: 'handlers'
};

/* $lab:coverage:on$ */
