/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Hoek = require('hoek');
const MongooseError = Mongoose.Error;
const MathJS = require('mathjs');


// Declare internals

const internals = {
    MODEL_NAME: 'event'
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const schema = new Schema({
        user: {
            type: ObjectId,
            ref: 'user',
            required: [true, 'error_user_required']
        },
        eventType: {
            type: String,
            enum: ['event_win', 'event_join']
        },
        value: {
            type: Number
        },
        list: {
            type: ObjectId,
            ref: 'list'
        },
        username: String
    });

    schema.pre('find', function () {

        this.populate('user', 'country');
    });

    schema.pre('findOne', function () {

        this.populate('user', 'country');
    });

    /**
     * Each time an event is generated, post the message to all
     * connected clients
     * */
    schema.post('save', function (event, next) {

        if (!event._wasNew) {
            return next();
        }

        this
        .model(internals.MODEL_NAME)
        .findById(event)
        .lean()
        .exec()
        .then((doc) => {

            Hoek.assert(doc, 'error_event_deleted_externally');
            server.publish('/event/created', doc);
            next();
        })
        .catch(MongooseError, next);
    });

    schema.set('toJSON', { virtuals: false });

    schema.options.toJSON.transform = function (doc, ret) {

        let decimals = server.settings.app.currency.decimals;

        if (ret.value) {
            ret.value = MathJS.round(ret.value, decimals);
        }
    };

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