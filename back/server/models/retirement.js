/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Hoek = require('hoek');
const MongooseError = Mongoose.Error;


// Declare internals

const internals = {
    MODEL_NAME: 'retirement'
};


exports.register = function (server, options, next) {

    const Request = Mongoose.model('request');
    const Schema = Mongoose.Schema;
    const schema = new Schema({
        value: {
            type: Number,
            required: [true, 'error_value_required']
        },
        secondKey: {
            type: String,
            required: [true, 'error_second_key_required']
        },
        btcAddress: {
            type: String
        }
    }, { discriminatorKey: 'kind' });

    /** Validate second key  */
    schema.path('secondKey').validate(function (value, callback) {

        this
        .model('user')
        .findById(this.createdBy)
        .exec()
        .then((user) => {

            if (!user) {
                callback(false);
                return;
            }

            user.compareSecondKey(value, (err, isMatch) => {

                callback(err || !isMatch ? false : true);
                return null;
            });

            return null;
        })
        .catch(MongooseError, () => callback(false));
    }, 'error_second_key_invalid');


    schema.pre('find', function () {

        this.populate('creator', 'username');
    });

    schema.pre('findOne', function () {

        this.populate('creator', 'username');
    });

    /** Save bitcoin address for this request */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isNew) {
            return done();
        }

        this
        .model('user')
        .findById(this.createdBy)
        .exec()
        .then((user) => {

            Hoek.assert(user, 'error_user_deleted_externally');
            this.btcAddress = user.btcAddress;

            done();
            return null;
        })
        .catch(done);
    });

    /** Validate If you have enough balance to request a withdrawal  */
    schema.path('value').validate(function (value, callback) {

        if (this.status !== 'pending') {
            return callback(true);
        }

        this
        .model('user')
        .findById(this.createdBy)
        .populate('wallet')
        .exec()
        .then((user) => {

            let walletBalance = Hoek.reach(user, 'wallet.balance');
            Hoek.assert(user, 'error_user_deleted_externally');

            return this
            .model('config')
            .findOne()
            .exec()
            .then((config) => {

                Hoek.assert(config, 'error_config_deleted_externally');
                return { walletBalance, config };
            });
        })
        .then((info) => {

            let walletBalance = info.walletBalance;
            let config = info.config;

            if (value < config.minimumBalanceToCollect) {
                callback(false);
                return null;
            }

            if (value > walletBalance) {
                callback(false);
                return null;
            }

            callback(true);
            return null;
        })
        .catch(MongooseError, () => callback(false));
    }, 'error_value_invalid');

    /**
     * Debit the money immediately, regardless of whether the application has been
     * processed. When the same is rejected, is when the money will be reintegrated
     * again into the internal purse.
     */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew) {
            return next();
        }

        this
        .model('movement')
        .create({
            user: doc.createdBy,
            movementType: 'retirement',
            debit: doc.value
        })
        .then(() => {

            next();
            return null;
        })
        .catch(MongooseError, next);
    });

    /** Notify to clients */
    schema.post('save', function (doc, next) {

        let _wasNew = doc._wasNew;

        this
        .model(internals.MODEL_NAME)
        .findById(doc)
        .lean()
        .then((doc) => {

            Hoek.assert(doc, 'error_retirement_deleted_externally');
            server.publish(_wasNew ? '/retirement/created' : '/retirement/updated', doc);
            next();
        })
        .catch(MongooseError, next);
    });

    /** Save bitcoin address for this request */
    schema.pre('save', true, function (next, done) {

        next();

        if (this.isNew) {
            return done();
        }

        if (!this.isModified('status')) {
            return done();
        }

        if (this.status !== 'rejected') {
            return done();
        }

        this.
        model('retirement')
        .findById(this)
        .exec()
        .then((retirement) => {

            Hoek.assert(retirement, 'error_retirement_deleted_externally');
            return retirement
            .toReverse();

        })
        .then(() => {

            done();
            return null;
        })
        .catch(MongooseError, done);
    });

    schema.methods.toReverse = function () {

        return this
        .model('movement')
        .create({
            user: this.createdBy,
            movementType: 'retirement_reverse',
            credit: this.value
        });
    };

    schema.post('remove', function (doc, next) {

        return doc
        .toReverse()
        .then(() => {

            next();
            return null;
        })
        .catch(MongooseError, next);
    });

    // Set model
    Request.discriminator(internals.MODEL_NAME, schema);

    // Log
    server.log('model', `Model ${internals.MODEL_NAME} loaded.`);

    next();
};


exports.register.attributes = {
    name: `model-${internals.MODEL_NAME}`,
    dependencies: ['mongoose', 'model-request']
};

/* $lab:coverage:on$ */
