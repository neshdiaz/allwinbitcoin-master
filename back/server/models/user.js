/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Bcrypt = require('bcrypt');
const Validator = require('validator');
const MongooseError = Mongoose.Error;
const Config = require('../../config');
const Jwt = require('jsonwebtoken');


// Declare internals

const internals = {
    SALT_WORK_FACTOR: 10,
    MODEL_NAME: 'user'
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const Mixed = Schema.Types.Mixed;
    const schema = new Schema({
        email: {
            type: String,
            required: [true, 'error_email_required'],
            validate: {
                validator: function (v) {

                    return Validator.isEmail(v);
                },
                message: 'error_invalid_email'
            },
            sort: true
        },
        username: {
            type: String,
            required: [true, 'error_username_required'],
            sort: true
        },
        avatar: {
            type: String
        },
        name: {
            type: String,
            required: [true, 'error_name_required'],
            sort: true
        },
        password: {
            type: String,
            required: [true, 'error_password_required']
        },
        passwordConfirmation: {
            type: String,
            required: [true, 'error_incorrect_password']
        },
        isAdmin: {
            type: Boolean
        },
        sponsor: {
            type: ObjectId,
            ref: 'user'
        },
        referredList: [{
            type: ObjectId,
            ref: 'user'
        }],
        referreds: {
            type: Number
        },
        activeReferredsList: [{
            type: ObjectId,
            ref: 'user'
        }],
        clones: {
            type: Number,
            default: 0
        },
        phone: {
            type: String,
            sort: true
        },
        country: {
            type: Mixed,
            required: [true, 'error_country_required']
        },
        city: {
            type: String,
            sort: true
        },
        language: {
            type: String,
            default: 'es'
        },
        status: {
            type: String,
            enum: ['active', 'locked', 'inactive'],
            default: 'inactive'
        },
        secondKey: {
            type: String
        },
        wallet: {
            type: ObjectId,
            ref: 'wallet'
        },
        config: {
            type: ObjectId,
            ref: 'config'
        },
        btcAddress: {
            type: String
        },

        // To know in which levels you have bought positions.
        // Important to determine when the position purchase is for the first time
        levels: [{
            type: ObjectId,
            ref: 'level'
        }],

        // Determine if it appears in the list of winners
        special: {
            type: Boolean,
            default: false
        },

        // Super sponsor
        // Fix bug when email changes
        super: {
            type: Boolean,
            default: false
        },

        activeLevels: [{
            type: ObjectId,
            ref: 'level'
        }]
    }, { discriminatorKey: 'role' });

    schema.pre('find', function () {

        this.populate('config wallet');
        this.populate('levels', 'identifier');
        this.populate('activeLevels', 'identifier');
    });

    schema.pre('findOne', function () {

        this.populate('config wallet');
        this.populate('levels', 'identifier');
        this.populate('activeLevels', 'identifier');
    });

    schema.path('email').validate(function (value, callback) {

        this.model(internals.MODEL_NAME)
        .findOne({
            _id: {
                '$ne': this._id     // Omit current record
            },
            email: value
        })
        .exec()
        .then((doc) => callback(doc ? false : true))
        .catch(() => callback(false));
    }, 'error_email_unique');

    schema.path('username').validate(function (value, callback) {

        let reserved = server.settings.app.usernames.find(
            (u) => u === value);

        if (reserved) {
            return callback(false);
        }

        this.model(internals.MODEL_NAME)
        .findOne({
            _id: {
                '$ne': this._id     // Omit current record
            },
            username: value
        })
        .exec()
        .then((doc) => callback(doc ? false : true))
        .catch(() => callback(false));
    }, 'error_username_unique');

    schema.path('passwordConfirmation').validate(function (value) {

        return this.password === value;
    }, 'error_incorrect_password');

    schema.virtual('isLocked').get(function () {

        return this.status === 'locked';
    });

    schema.virtual('isInactive').get(function () {

        return this.status === 'inactive';
    });

    schema.virtual('activeReferreds').get(function () {

        return ((this.activeReferredsList &&
                this.activeReferredsList.length) || 0);
    });

    schema.virtual('isUser').get(function () {

        return !this.isAdmin;
    });

    schema.methods.comparePassword = function (password, callback) {

        Bcrypt.compare(password, this.password, callback);
    };

    schema.methods.compareSecondKey = function (secondKey, callback) {

        Bcrypt.compare(secondKey, this.secondKey, callback);
    };

    schema.pre('save', true, function (next, done) {

        next();

        if (this.isNew) {
            this.referreds = 0;
            this.activeReferreds = 0;
        }

        done();
    });

    /** Encrypt password */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isModified('password')) {
            return done();
        }

        Bcrypt.genSalt(internals.SALT_WORK_FACTOR, (err, salt) => {

            if (err) {
                return done(err);
            }

            Bcrypt.hash(this.password, salt, (err, hash) => {

                if (err) {
                    return done(err);
                }

                this.password = hash;
                this.passwordConfirmation = hash;
                return done();
            });
        });
    });

    /** Encrypt second key */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isModified('secondKey')) {
            return done();
        }

        Bcrypt.genSalt(internals.SALT_WORK_FACTOR, (err, salt) => {

            if (err) {
                return done(err);
            }

            Bcrypt.hash(this.secondKey, salt, (err, hash) => {

                if (err) {
                    return done(err);
                }

                this.secondKey = hash;
                return done();
            });
        });
    });

    /** Ensure that every user has connection to the system configuration */
    schema.pre('save', true, function (next, done) {

        next();

        if (this.config) {
            return done();
        }

        if (server.app.CONFIG_ID) {
            this.config = server.app.CONFIG_ID;
            return done();
        }

        this
        .model('config')
        .findOne()
        .exec()
        .then((config) => {

            if (!config) {
                let msg = 'Config record not found.';
                server.log('error', msg);
                throw new Error(msg);
            }

            this.config = config;
            return done();
        })
        .catch(done);
    });

    /** Set sponsor */
    schema.pre('save', true, function (next, done) {

        next();

        if (this.sponsor) {
            return done();
        }

        this.sponsor = server.app.SPONSOR;
        return done();
    });

    /** Insert referred */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew) {
            return next();
        }

        this
        .model('user')
        .findById(doc.sponsor)
        .exec()
        .then((sponsor) => {

            return this
            .model('user')
            .findByIdAndUpdate(sponsor, {
                $addToSet: {
                    referredList: doc
                }
            })
            .exec();
        })
        .then(() => {

            next();
            return null;
        })
        .catch(MongooseError, next);
    });

    /** Create wallet */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew) {
            return next();
        }

        this.model('wallet').create({
            user: doc,
            balance: 0
        })
        .then(() => next())
        .catch(next);
    });

    /** Increment referreds */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew) {
            return next();
        }

        this.model('user')
        .findByIdAndUpdate(doc.sponsor, {
            $inc: {
                referreds: 1
            }
        }).exec()
        .then(() => next())
        .catch(next);
    });

    /** Send welcome email */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew) {
            return next();
        }

        const token = Jwt.sign(
            { _id: doc._id },
            Config.get('/authentication/activateUserToken')
        );
        const data = {
            to: doc.email,
            subject: `Bienvenido`,
            html: {
                path: 'new-user.html'
            },
            context: {
                user: doc,
                token
            }
        };

        server
        .plugins
        .mailer
        .send(data, () => {

            next();
        });
    });

    /** Send mail when BTC address is modified */
    schema.pre('save', true, function (next, done) {

        next();

        if (this.isNew) {
            return done();
        }

        if (!this.isModified('btcAddress')) {
            return done();
        }

        const data = {
            to: this.email,
            subject: `Billetera Bitcoin actualizada`,
            html: {
                path: 'btcAddress-updated.html'
            },
            context: {
                user: this
            }
        };

        server
        .plugins
        .mailer
        .send(data, () => {

            done();
        });
    });

    schema.set('toJSON', { virtuals: true });

    schema.options.toJSON.transform = function (doc, ret) {

        ret.password = '';
        ret.passwordConfirmation = '';
        ret.secondKey = '';

        delete ret.special;
    };

    schema.options.toObject = schema.options.toJSON;

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
