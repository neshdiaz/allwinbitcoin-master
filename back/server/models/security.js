/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const MongooseError = Mongoose.Error;
const Hoek = require('hoek');
const Randtoken = require('rand-token');


// Declare internals

const internals = {
    MODEL_NAME: 'security',
    SALT_WORK_FACTOR: 6
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const schema = new Schema({
        token: {
            type: String
        },
        date: {
            type: Date,
            expires: 60 * 20    // 20 mins
        },
        tokenFor: {
            type: String,
            enum: ['new_second_key']
        }
    });

    /** Create new token to send by mail */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isNew) {
            return done();
        }

        let token = Randtoken.generate(internals.SALT_WORK_FACTOR);

        this
        .model(internals.MODEL_NAME)
        .remove({
            createdBy: this.createdBy,
            tokenFor: this.tokenFor
        })
        .exec()
        .then(() => {

            this.token = token;
            this.date = new Date();

            return this
            .model('user')
            .findById(this.createdBy)
            .exec();
        })
        .then((user) => {

            let data = {
                to: user.email,
                subject: `Token de seguridad`,
                html: {
                    path: 'new-token.html'
                },
                context: {
                    token,
                    user
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

    schema.set('toJSON', { virtuals: false });

    schema.options.toJSON.transform = function (doc, ret) {

        delete ret.token;
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
