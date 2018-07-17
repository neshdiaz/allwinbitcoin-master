/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Async = require('async');
const Hoek = require('hoek');
const Lodash = require('lodash');
const MongooseError = Mongoose.Error;


// Declare internals

const internals = {
    MODEL_NAME: 'payment'
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
        account: {
            type: ObjectId,
            ref: 'account',
            required: [true, 'error_account_required']
        },
        value: {
            type: Number,
            required: [true, 'error_value_required']
        },
        level: {
            type: ObjectId,
            ref: 'level'
        },
        list: {
            type: ObjectId,
            ref: 'list'
        },
        internal: {
            type: Boolean,
            default: false
        }
    });

    /** Populate list and level fields */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isNew) {
            return done();
        }

        this.model('account')
        .findById(this.account)
        .populate('list')
        .populate('level')
        .exec()
        .then((account) => {

            Hoek.assert(account, 'error_account_not_found_in_payment');

            this.list = account.list;
            this.level = account.level;

            return done();
        })
        .catch(MongooseError, done);
    });

    schema.post('save', function (payment, next) {

        if (!payment._wasNew) {
            return next();
        }

        // Obtain all the necessary information
        Async.auto({
            account: (callback) => {

                this
                .model('account')
                .findById(this.account)
                .exec()
                .then((account) => callback(null, account))
                .catch(MongooseError, callback);
            },
            level: (callback) => {

                this
                .model('level')
                .findById(this.level)
                .exec()
                .then((level) => callback(null, level))
                .catch(MongooseError, callback);
            },
            list: (callback) => {

                this
                .model('list')
                .findById(this.list)
                .exec()
                .then((list) => callback(null, list))
                .catch(MongooseError, callback);
            },
            beneficiaryAccount: ['list', (data, callback) => {

                this
                .model('account')
                .findOne({
                    list: data.list,
                    position: 1
                })
                .populate('user')
                .exec()
                .then((account) => callback(null, account))
                .catch(MongooseError, callback);
            }],
            beneficiaryUser: ['beneficiaryAccount', (data, callback) => {

                return callback(null, data.beneficiaryAccount.user);
            }],
            user: (callback) => {

                this
                .model('user')
                .findById(this.user)
                .populate('sponsor')
                .exec()
                .then((user) => callback(null, user))
                .catch(MongooseError, callback);
            },
            // Get sponsor for quick start bonus
            sponsor: ['user', (data, callback) => {

                this
                .model('user')
                .findById(data.user.sponsor)
                .populate('levels')
                .exec()
                .then((user) => callback(null, user))
                .catch(MongooseError, callback);
            }],
            // If it is the first payment made by the user in this level and
            // the sponsor is active in the level, deliver the bonus fast
            quickStartBonus: ['sponsor', 'level', (data, callback) => {

                if (!data.sponsor) {
                    // This can only happen for the super sponsor
                    // TODO: possible validation
                    return callback(null, false);
                }

                Hoek.assert(data.level, 'error_level_not_found_in_payment');

                let levels = Hoek.reach(data, 'sponsor.levels');

                if (!Array.isArray(levels)) {
                    levels = [levels];
                }

                // The user must be active on at least one level
                if (levels.length <= 0) {
                    return callback(null, false);
                }

                // Check level
                // let level = levels.find(
                //     (l) => Lodash.isEqual(l.id, data.level.id)
                // );

                // if (!level) {
                //     // You lose the right to the bonus payment  :(
                //     server.log('info', `Sponsor ${data.sponsor.username} lose quickly bonus
                //                         payment for user ${this.user}`);
                //     return callback(null, false);
                // }

                this
                .model('payment')
                .count({
                    user: this.user,
                    level: data.level
                })
                .exec()
                .then((total) => {

                    if (total > 1) {
                        return callback(null, false);
                    }

                    return callback(null, true);
                })
                .catch(MongooseError, callback);
            }]
        }, (err, data) => {

            if (err) {
                return next(err);
            }

            // NOTE: It is an internal payment (cycling) to pay only net to
            // the beneficiary

            let level = data.level;
            let quickStartBonus = this.internal
                                    ? 0
                                    : (data.quickStartBonus
                                        // ? this.value * (level.quickStartBonus / 100)
                                        ? level.quickStartBonus
                                        : 0);
            let commission = this.value * (level.commission / 100);
            let netWorth = this.internal ? this.value : this.value - commission;

            // Quick bonus must be assumed by the commission
            commission = commission - quickStartBonus;

            let createMovementForBeneficiary = (callback) => {

                this
                .model('movement')
                .create({
                    user: data.beneficiaryUser,
                    movementType: 'payment',
                    credit: netWorth,
                    list: data.list,
                    from: data.account.username
                })
                .then(() => callback())
                .catch(MongooseError, callback);
            };

            let createMovement = (callback) => {

                this.model('movement')
                .create({
                    user: this.user,
                    movementType: 'payment',
                    debit: this.value,
                    list: data.list
                })
                .then(() => callback())
                .catch(MongooseError, callback);
            };

            let createInternalMovement = (callback) => {

                if (this.internal) {
                    return callback();
                }

                this.model('movement')
                .create({
                    user: server.app.SPONSOR._id,
                    movementType: 'commission',
                    credit: commission,
                    list: data.list,
                    from: data.account.username
                })
                .then(() => callback())
                .catch(MongooseError, callback);
            };

            let payQuickStartBonus = (callback) => {

                if (this.internal || quickStartBonus <= 0) {
                    return callback();
                }

                this.model('movement')
                .create({
                    user: data.sponsor,
                    movementType: 'quick_start_bonus',
                    credit: quickStartBonus,
                    list: data.list,
                    from: data.account.username
                })
                .then(() => callback())
                .catch(MongooseError, callback);
            };

            let createEvent = (callback) => {

                this.model('event')
                .create({
                    user: data.beneficiaryUser,
                    username: data.beneficiaryAccount.username,
                    value: netWorth,
                    list: data.list,
                    eventType: 'event_win'
                })
                .then(() => callback())
                .catch(MongooseError, callback);
            };

            Async.parallel([
                // Debit
                createMovement,

                // Credit
                createMovementForBeneficiary,

                // Credit (commision)
                createInternalMovement,

                // Credit
                payQuickStartBonus,

                // Notify to all
                createEvent
            ], next);
        });
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
