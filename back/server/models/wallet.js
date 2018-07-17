/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const MongooseError = Mongoose.Error;
const MathJS = require('mathjs');


// Declare internals

const internals = {
    MODEL_NAME: 'wallet'
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
        balance: {
            type: Number,
            default: 0
        }
    });

    /** Assign wallet to user. */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew) {
            return next();
        }

        this
        .model('user')
        .findByIdAndUpdate(doc.user, {
            $set: {
                wallet: doc
            }
        })
        .exec()
        .then(() => next())
        .catch(MongooseError, next);
    });

    schema.set('toJSON', { virtuals: false });

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
