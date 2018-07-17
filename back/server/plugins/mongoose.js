/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-auto-increment');
const Async = require('async');


// Declare internals

const internals = {
    plugins: {}
};


exports.register = function (server, options, next) {

    // Debugging
    // Mongoose.set('debug', !server.settings.app.isProduction);

    // Set promise hook
    Mongoose.Promise = require('bluebird');

    // Connect to database
    Mongoose.connect(options.uri, (err) => {

        AutoIncrement.initialize(Mongoose.connection);

        // Expose custom mongoose plugins
        server.expose(internals.plugins);

        return next(err);
    });
};


exports.register.attributes = {
    name: 'mongoose'
};


internals.plugins.baseFields = function (schema, options) {

    options = options || {};

    const ObjectId = Mongoose.Schema.Types.ObjectId;
    const prefix = options.prefix || '__';
    const transform = options.transform || function (val) {

        return val && val.toLowerCase();
    };

    schema.add({ createdAt: Date });
    schema.add({ updatedAt: Date });
    schema.add({
        createdBy: {
            type: ObjectId,
            ref: 'user'
        }
    });
    schema.add({
        updatedBy: {
            type: ObjectId,
            ref: 'user'
        }
    });

    let tasks = [];
    let linkTasks = [];

    schema.eachPath((key, path) => {

        if (path.options.sort) {
            const _key = `${prefix}${key}`;

            schema.add(
                {
                    [`${_key}`]: {
                        type: String,
                        lowercase: true
                    }
                }
            );

            if (path.instance !== 'ObjectID') {
                schema.path(key).set(function (val) {

                    this[_key] = val;
                    return val;
                });
            }
            else {
                tasks.push({
                    ref: path.options.ref,
                    key,
                    _key,
                    identifier: path.options.identifier
                });
            }
        }

        if (path.options.links) {
            const links =  Array.isArray(path.options.links) ? path.options.links : [path.options.links];

            links.forEach((link) => {

                link = link.split(':');

                linkTasks.push({
                    key,
                    model: link[0],
                    field: link[1],
                    _key: link[2] || `${prefix}${link[1]}`
                });
            });
        }
    });

    // Set on schema
    schema.set('tasks', tasks);
    schema.set('linkTasks', linkTasks);

    schema.pre('save', true, function (next, done) {

        this.updatedAt = new Date();
        this._wasNew = this.isNew;      // Internal purpose

        next();

        let tasks = this.schema.get('tasks') || [];
        let linkTasks = this.schema.get('linkTasks') || [];

        if (this.isNew) {
            this.createdAt = this.updatedAt;

            if (!tasks.length) {
                return done();
            }

            tasks = tasks.map((task) => {

                return (next) => {

                    this.model(task.ref)
                    .findById(this.get(task.key))
                    .exec()
                    .then((doc) => {

                        this.set(task._key, doc && doc.get(task.identifier));
                        return next();
                    })
                    .catch(next);
                };
            })

            return Async.parallel(tasks, done);
        }

        linkTasks = linkTasks.filter((link) => {

            return this.isModified(link.key)
        });

        linkTasks = linkTasks.map((link) => {

            return (next) => {

                this.model(link.model).update({
                    [link.field]: this
                }, {
                    $set: {
                        [link._key]: transform(this.get(link.key))
                    }
                }, {
                    multi: true
                }).exec()
                .then(() => next())
                .catch(next);
            };
        });

        if (!linkTasks.length) {
            return done();
        }

        return Async.parallel(linkTasks, done);
    });
};

/* $lab:coverage:on$ */