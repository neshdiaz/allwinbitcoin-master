/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const MongooseError = Mongoose.Error;
const Hoek = require('hoek');
const Randtoken = require('rand-token');


// Declare internals

const internals = {
    MODEL_NAME: 'forgot-password',
     SALT_WORK_FACTOR: 6
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const schema = new Schema({
        identifier: {
            type: String,
            required: [true, 'error_identifier_required']
        },
        date: {
            type: Date,
            expires: 5 * 60
        }
    });

    /** Validate if user exists  */
    schema.path('identifier').validate(function (value, callback) {

        this
        .model('user')
        .findOne({
            $or: [
                {
                    username: value
                },
                {
                    email: value
                }
            ]
        })
        .exec()
        .then((user) => {

            callback(user ? true : false);
            return null;
        })
        .catch(MongooseError, () => callback(false));
    }, 'error_identifier_invalid');

    /** Update password and send Email */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isNew) {
            return done();
        }

        // Expires control
        this.date = new Date();

        let newPassword;

        this
        .model('user')
        .findOne({
            $or: [
                {
                    username: this.identifier
                },
                {
                    email: this.identifier
                }
            ]
        })
        .exec()
        .then((user) => {

            Hoek.assert(user, 'error_user_deleted_externally');

            newPassword = Randtoken.generate(internals.SALT_WORK_FACTOR);

            user.password = newPassword;
            user.passwordConfirmation = newPassword;
            return user.save();
        })
        .then((user) => {

            // Send email

            let data = {
                to: user.email,
                subject: `Olvido de contraseña`,
                html: {
                    path: 'forgot-password.html'
                },
                context: {
                    user,
                    newPassword
                }
            };

            server
            .plugins
            .mailer
            .send(data, done);

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