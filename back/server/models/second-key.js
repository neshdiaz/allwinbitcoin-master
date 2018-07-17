/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const MongooseError = Mongoose.Error;
const Hoek = require('hoek');


// Declare internals

const internals = {
    MODEL_NAME: 'second-key'
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const schema = new Schema({
        token: {
            type: String,
            required: [true, 'error_token_required']
        },
        key: {
            type: String,
            required: [true, 'error_key_required']
        },
        date: {
            type: Date,
            expires: 5 * 60
        }
    });

    /** Validate security token */
    schema.path('token').validate(function (value, callback) {

        this
        .model('security')
        .findOne({
            token: value,
            tokenFor: 'new_second_key',
            createdBy: this.createdBy
        })
        .exec()
        .then((doc) => {

            callback(!doc ? false : true);
            return null;
        })
        .catch(MongooseError, () => callback(false));
    }, 'error_token_invalid');

    /** Apply business logic */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isNew) {
            return done();
        }

        // Expires control
        this.date = new Date();

        this
        .model('user')
        .findById(this.createdBy)
        .exec()

        /** Update second key */
        .then((user) => {

            Hoek.assert(user, 'error_user_deleted_externally');

            user.secondKey = this.key;
            return user.save();
        })

        /** Remove previous security tokens */
        .then((createdBy) => {

            return this
            .model('security')
            .remove({
                createdBy,
                tokenFor: 'new_second_key'
            });
        })
        .then(() => {

            done();
            return null;
        })
        .catch(MongooseError, done);
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