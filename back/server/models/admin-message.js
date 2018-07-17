/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const MongooseError = Mongoose.Error;
const Hoek = require('hoek');


// Declare internals

const internals = {
    MODEL_NAME: 'admin-message'
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const schema = new Schema({
        message: {
            type: String,
            required: [true, 'error_message_required'],
            sort: true
        },
        status: {
            type: String,
            enum: ['m_active', 'm_inactive'],
            required: [true, 'error_status_required']
        },
        style: {
            type: String,
            required: [true, 'error_style_required'],
            sort: true
        }
    });

    /** Websocket support */
    schema.post('save', function (doc, next) {

        const _wasNew = doc._wasNew;

        this
        .model(internals.MODEL_NAME)
        .findById(doc)
        .lean()
        .exec()
        .then((doc) => {

            Hoek.assert(doc, `error_${internals.MODEL_NAME}_deleted_externally`);
            server.publish(_wasNew ? `/${internals.MODEL_NAME}/created`
                                    : `/${internals.MODEL_NAME}/updated`, doc);
            next();
        })
        .catch(MongooseError, next);
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
