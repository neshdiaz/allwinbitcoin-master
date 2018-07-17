/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');


// Declare internals

const internals = {
    MODEL_NAME: 'request'
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const schema = new Schema({
        status: {
            type: String,
            enum: ['pending', 'completed', 'error', 'rejected'],
            default: 'pending',
            sort: true
        },
        causeOfRejection: {
            type: String,
            sort: true
        },
        progress: Number,
        observations: {
            type: String,
            sort: true
        },
        internal: {
            type: Boolean,
            default: false
        },

        // Fix discriminator fields
        level: {
            type: ObjectId,
            ref: 'level',
            sort: true,
            identifier: 'abbr'
        },

        creator: {
            type: ObjectId,
            ref: 'user',
            sort: true,
            identifier: 'username'
        }
    }, { discriminatorKey: 'kind' });

    schema.pre('find', function () {

        this.populate('level');
    });

    schema.pre('findOne', function () {

        this.populate('level');
    });

    schema.pre('save', true, function (next, done) {

        next();

        if (this.isNew) {
            this.status = 'pending';
        }

        return done();
    });

    schema.plugin(server.plugins.mongoose.baseFields);

    // Set model
    Mongoose.model(internals.MODEL_NAME, schema);

    // Log
    server.log('model', `Model ${internals.MODEL_NAME} loaded.`);

    next();
};


exports.register.attributes = {
    name: `model-${internals.MODEL_NAME}`,
    dependencies: 'mongoose'
};

/* $lab:coverage:on$ */