/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const MongooseError = Mongoose.Error;
const Promise = require('bluebird');
const Hoek = require('hoek');
const MathJS = require('mathjs');


// Declare internals

const internals = {
    MODEL_NAME: 'transfer'
};


exports.register = function (server, options, next) {

    const Request = Mongoose.model('request');
    const Schema = Mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const schema = new Schema({
        to: {
            type: String,
            required: [true, 'error_to_required']
        },
        __to: String,
        secondKey: {
            type: String,
            required: [true, 'error_second_key_required']
        },
        value: {
            type: Number,
            required: [true, 'error_value_required']
        },
        user: {
            type: ObjectId,
            ref: 'user'
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

    /** Validate user to whom the transfer is to be sent  */
    schema.path('to').validate(function (value, callback) {

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

            callback(!user ? false : true);
            return null;
        })
        .catch(MongooseError, () => callback(false));
    }, 'error_to_invalid');

    /** For sort purpose */
    schema.path('to').set(function (v) {

        this.__to = v && v.toLowerCase();
        return v;
    });

    /** Get user */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isNew) {
            return done();
        }

        this
        .model('user')
        .findOne({
            $or: [
                {
                    username: this.to
                },
                {
                    email: this.to
                }
            ]
        })
        .exec()
        .then((user) => {

            this.user = user;
            done();
            return null;
        })
        .catch(MongooseError, done);
    });

    /** Create new job */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew) {
            return next();
        }

        server
        .plugins
        .transfer
        .createJob(doc, next);
    });

    schema.methods.reject = function (job, causeOfRejection) {

        this.status = 'rejected';
        this.causeOfRejection = causeOfRejection;
        this.progress = 100;

        return this.save();
    };

    schema.methods.error = function (err) {

        this.status = 'error';
        this.observations = err && err.message;
        this.progress = 100;

        server.log('error', err);

        return this.save();
    };

    schema.methods.approve = function (info) {

        let wallet = info.wallet;
        let config = info.config;
        let createdBy = info.createdBy;
        let to = info.to;

        let commission = config.transferFee;
        let netWorth = this.value - commission;
        let tasks = [];

        let transferFee = () => {

            return this
            .model('movement')
            .create({
                user: createdBy,
                movementType: 'transfer_fee',
                debit: commission,
                to: to.username
            });
        };

        let transferFeeCredit = () => {

            return this
            .model('user')
            .findOne({
                super: true
            })
            .exec()
            .then((sponsor) => {

                Hoek.assert(sponsor,
                            'error_super_sponsor_deleted_externally');

                return this
                .model('movement')
                .create({
                    user: sponsor,
                    movementType: 'transfer_fee',
                    credit: commission,
                    from: createdBy.username,
                    to: to.username
                });
            });
        };

        let transferDebit = () => {

            return this
            .model('movement')
            .create({
                user: createdBy,
                movementType: 'transfer',
                debit: netWorth,
                to: to.username
            });
        };

        let transferCredit = () => {

            return this
            .model('movement')
            .create({
                user: this.user,
                movementType: 'transfer',
                credit: netWorth,
                from: createdBy.username,
                to: to.username
            });
        };

        tasks.push(transferDebit()),
        tasks.push(transferFee());
        tasks.push(transferCredit());
        tasks.push(transferFeeCredit());

        return Promise
        .all(tasks)
        .then(() => {

            this.status = 'completed';
            this.progress = 100;

            return this.save();
        });
    };

    /** Business logic */
    schema.methods.process = function (job) {

        // Custom error
        function NoCredit() {};
        NoCredit.prototype = Object.create(Error.prototype);

        let getWallet = () => {

            return this
            .model('wallet')
            .findOne({
                user: this.createdBy
            })
            .exec();
        };

        let getConfig = () => {

            return this
            .model('config')
            .findOne()
            .exec();
        };

        let getCreatedBy = () => {

            return this
            .model('user')
            .findById(this.createdBy)
            .exec();
        };

        let getTo = () => {

            return this
            .model('user')
            .findById(this.user)
            .exec();
        }

        return Promise
        .props({
            wallet: getWallet(),
            config: getConfig(),
            createdBy: getCreatedBy(),
            to: getTo()
        })
        .then((result) => {

            let wallet = result.wallet;
            let config = result.config;
            let createdBy = result.createdBy;
            let to = result.to;

            Hoek.assert(wallet, 'error_wallet_deleted_externally');
            Hoek.assert(config, 'error_config_deleted_externally');
            Hoek.assert(createdBy, 'error_user_deleted_externally');
            Hoek.assert(to, 'error_user_deleted_externally');

            if (wallet.balance < this.value) {
                throw new NoCredit();
            }

            return this
            .approve(result);
        })
        .catch(NoCredit, () => {

            return this
            .reject(job, 'transfer_reject_no_credit');
        })
        .catch((err) => {

            return this
            .error(err);
        });
    };

    /** Notify to clients */
    schema.post('save', function (doc, next) {

        let _wasNew = doc._wasNew;

        this
        .model(internals.MODEL_NAME)
        .findById(doc)
        .lean()
        .exec()
        .then((doc) => {

            Hoek.assert(doc, 'error_transfer_deleted_externally');
            server.publish(_wasNew ? '/transfer/created' : '/transfer/updated', doc);
            next();

            return null;
        })
        .catch(MongooseError, next);
    });

    schema.set('toJSON', { virtuals: false });

    schema.options.toJSON.transform = function (doc, ret) {

        ret.secondKey = '';
        delete ret.user;
    };

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
