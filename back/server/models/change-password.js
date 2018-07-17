/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const MongooseError = Mongoose.Error;
const Hoek = require('hoek');


// Declare internals

const internals = {
    MODEL_NAME: 'change-password'
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const schema = new Schema({
        currentPassword: {
            type: String,
            required: [true, 'error_currentPassword_required']
        },
        password: {
            type: String,
            required: [true, 'error_password_required']
        },
        date: {
            type: Date,
            expires: 5 * 60
        }
    });

    /** Validate current password  */
    schema.path('currentPassword').validate(function (value, callback) {

        this
        .model('user')
        .findById(this.createdBy)
        .exec()
        .then((user) => {

            if (!user) {
                callback(false);
                return;
            }

            user.comparePassword(value, (err, isMatch) => {

                callback(err || !isMatch ? false : true);
                return null;
            });

            return null;
        })
        .catch(MongooseError, () => callback(false));
    }, 'error_current_password_invalid');

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
        .then((user) => {

            Hoek.assert(user, 'error_user_deleted_externally');

            user.password = this.password;
            user.passwordConfirmation = this.password;
            return user.save();
        })
        .then(() => {

            done();
            return null;
        })
        .catch(MongooseError, done);
    });

    schema.set('toJSON', { virtuals: false });

    schema.options.toJSON.transform = function (doc, ret) {

        ret.password = '';
        ret.currentPassword = '';
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