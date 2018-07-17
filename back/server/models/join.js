/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Promise = require('bluebird');
const Async = require('async');
const Hoek = require('hoek');
const ParallelPromise = Promise.promisify(Async.parallel);
const AutoPromise = Promise.promisify(Async.auto);
const MongooseError = Mongoose.Error;


// Declare internals

const internals = {
    MODEL_NAME: 'join'
};


exports.register = function (server, options, next) {

    const Request = Mongoose.model('request');
    const Schema = Mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const schema = new Schema({
        level: {
            type: ObjectId,
            ref: 'level',
            required: [true, 'error_level_required']
        },
        user: {
            type: ObjectId,
            ref: 'user',
            required: [true, 'error_user_required']
        },
        list: {
            type: ObjectId,
            ref: 'list'
        },

        // Field that will be used primarily in internal requests
        username: String
    }, { discriminatorKey: 'kind' });

    /** Avoid progress with null value */
    schema.pre('save', function (next) {

        if (this.isNew) {
            this.progress = 0;
        }

        next();
    });

    /**
     * Set the username that will have the application for entry and
     * with it the account that will be created in case of approval
     */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isNew) {
            // Only new records
            return done();
        }

        if (this.username) {
            // Nothing to do
            return done();
        }

        let _user = (callback) => {

            this
            .model('user')
            .findById(this.user)
            .exec()
            .then((doc) => callback(null, doc))
            .catch(MongooseError, callback);
        };

        let _config = ['_user', (info, callback) => {

            let user = info._user;
            Hoek.assert(user, 'error_user_deteled_externally');

            this
            .model('config')
            .findById(user.config)
            .exec()
            .then((doc) => callback(null, doc))
            .catch(MongooseError, callback);
        }];

        let _isSpecialUser = ['_user', (info, callback) => {

            let user = info._user;
            Hoek.assert(user, 'error_user_deteled_externally');

            callback(null, user.special);
        }];

        let _getAndSetUsername = ['_config', '_isSpecialUser', '_user',
            (info, callback) => {

            // username for default
            this.username = Hoek.reach(info, '_user.username');

            if (!info._isSpecialUser) {
                return callback();
            }

            let config = info._config;
            Hoek.assert(config, 'error_config_deteled_externally');

            let username = server.settings.app.usernames[config.lastIndex];

            // Set for new join request
            this.username = username;

            callback(null, username);
        }];

        let _updateConfig = ['_config', '_isSpecialUser', (info, callback) => {

            if (!info._isSpecialUser) {
                return callback();
            }

            this
            .model('config')
            .findByIdAndUpdate(info._config, {
                $inc: { lastIndex: 1 }
            })
            .exec()
            .then(() => callback())
            .catch(MongooseError, callback);
        }];

        Async.auto({
            _user,
            _config,
            _isSpecialUser,
            _getAndSetUsername,
            _updateConfig
        }, done);
    });

    /** Create new job */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew) {
            return next();
        }

        server
        .plugins
        .join
        .createJob(doc, next);
    });

    schema.methods.reject = function (job, causeOfRejection) {

        this.status = 'rejected';
        this.causeOfRejection = causeOfRejection;
        this.progress = 100;

        return this.save();
    };

    /** Increment activeReferreds for clones to sponsor user */
    schema.methods.incActiveReferreds = function (isFirstBuy) {

        if (!isFirstBuy || this.internal) {
            return Promise.resolve(null);
        }

        return this
        .model('user')
        .findById(this.user)
        .populate('sponsor')
        .exec()
        .then((user) => {

            let sponsor = Hoek.reach(user, 'sponsor');
            if (!sponsor) {
                server.log('warn',
                            `User "${user.username}" don't have sponsor`);
                return null;
            }

            return this
            .model('clone')
            .findOneAndUpdate({
                user: sponsor,
                level: this.level
            }, {
                $inc: {
                    count: 1,
                    total: 1
                }
            }, {
                upsert: true,
                new: true
            })
            .exec()
            .then((clone) => {

                if (clone && clone.total >= 2) {
                    return this.activateStatusOnSponsor();
                }

                return clone;
            });
        });
    };

    /** For sponsor active status on this level */
    schema.methods.activateStatusOnSponsor = function () {

        return this
        .model('user')
        .findById(this.user)
        .populate('sponsor')
        .exec()
        .then((user) => {

            let sponsor = Hoek.reach(user, 'sponsor');
            if (!sponsor) {
                server.log('warn',
                            `User "${user.username}" don't have sponsor`);
                return null;
            }

            return this
            .model('user')
            .findByIdAndUpdate(sponsor, {
                $addToSet: {
                    activeLevels: this.level
                }
            })
            .exec();
        });
    };

    schema.methods.approve = function (account, value, isFirstBuy) {

        let updateStatus = (callback) => {

            this.status = 'completed';
            this.progress = 100;
            this.list = account.list;

            this
            .save()
            .then(() => callback())
            .catch(MongooseError, callback);
        };

        let createPayment = (callback) => {

            this
            .model('payment')
            .create({
                user: this.user,
                account,
                value,
                internal: this.internal
            })
            .then(() => callback())
            .catch(MongooseError, callback);
        };

        let decActiveReferreds = (callback) => {

            if (isFirstBuy) {
                return callback();
            }

            this
            .model('clone')
            .findOneAndUpdate({
                level: this.level,
                user: this.user
            }, {
                $inc: {
                    count: -2
                }
            })
            .exec()
            .then(() => callback())
            .catch(MongooseError, callback);
        };

        let tasks = [updateStatus,
                    createPayment,
                    decActiveReferreds
                    ];
        return ParallelPromise(tasks)
        .then(() => {

            return account.validateCycling();
        });
    };

    schema.methods.error = function (err) {

        this.status = 'error';
        this.observations = err && err.message;
        this.progress = 100;

        server.log('error', err);

        return this.save();
    };

    /*** For clones, always look for the global list */
    schema.methods.findListForClone = function (job) {

        let _user = (callback) => {

            this
            .model('user')
            .findById(this.user)
            .populate('wallet')
            .exec()
            .then((doc) => callback(null, doc))
            .catch(MongooseError, callback);
        };

        let _level = (callback) => {

            this
            .model('level')
            .findById(this.level)
            .exec()
            .then((doc) => callback(null, doc))
            .catch(MongooseError, callback);
        };

        let _list = (callback) => {

            let conditions = {
                status: 'active',

                // With space available
                $where: 'this.users.length <= 6',

                blocked: false,

                // Same level
                level: this.level
            };

            if (!this.internal) {
                // If it is not an internal request, skip lists where the
                // same user
                conditions.users = {
                    $nin: [this.user]
                };
            }

            this
            .model('list')
            .find(conditions)
            .sort('number')
            .exec()
            .then((docs) => callback(null, docs[0]))
            .catch(MongooseError, callback);
        };

        return AutoPromise({
            _user,
            _level,
            _list
        });
    };

    /***
     * Search list for the first position purchase.
     * Applies also when the system automatically clones the user
     * */
    schema.methods.findListForFirstBuy = function (job) {

        let _user = (callback) => {

            this
            .model('user')
            .findById(this.user)
            .populate('wallet sponsor')
            .exec()
            .then((doc) => callback(null, doc))
            .catch(MongooseError, callback);
        };

        let _level = (callback) => {

            this
            .model('level')
            .findById(this.level)
            .exec()
            .then((doc) => callback(null, doc))
            .catch(MongooseError, callback);
        };

        let _sponsor = ['_user', (info, callback) => {

            let user = info._user;
            Hoek.assert(user, 'error_user_deleted_externally');

            let sponsor = user.sponsor;

            if (!sponsor) {
                server.log('warn', `User: ${user.username} don't have sponsor.`);
                return callback(null, null);
            }

            this
            .model('user')
            .findById(sponsor)
            .exec()
            .then((doc) => callback(null, doc))
            .catch(MongooseError, callback);
        }];

        let _sponsorOfSponsor = ['_sponsor', (info, callback) => {

            let sponsor = info._sponsor;

            if (!sponsor) {
                return callback(null, null);
            }

            let sponsorOfSponsor = sponsor.sponsor;

            if (!sponsorOfSponsor) {
                server.log('warn', `User: ${sponsor.username} don't have sponsor. (sponsor of sponsor)`);
                return callback(null, null);
            }

            this
            .model('user')
            .findById(sponsorOfSponsor)
            .exec()
            .then((doc) => callback(null, doc))
            .catch(MongooseError, callback);
        }];

        let _sponsorList = ['_sponsor', (info, callback) => {

            let sponsor = info._sponsor;

            if (!sponsor) {
                return callback(null, null);
            }

            let conditions = {
                status: 'active',

                // With space available
                $where: 'this.users.length <= 6',

                // Check if sponsor is there
                users: {
                    $in: [sponsor]
                },

                blocked: false,

                // Same level
                level: this.level
            };

            if (!this.internal) {
                // If it is not an internal request, skip lists where the
                // same user
                // --------- 24 jul (remove this condition)
                //conditions.users['$nin'] = [this.user];
            }

            this
            .model('list')
            .find(conditions)
            .sort('number')
            .exec()
            .then((docs) => callback(null, docs[0]))
            .catch(MongooseError, callback);
        }];

        let _sponsorOfSponsorList = ['_sponsorOfSponsor', (info, callback) => {

            let sponsorOfSponsor = info._sponsorOfSponsor;

            if (!sponsorOfSponsor) {
                return callback(null, null);
            }

            let conditions = {
                status: 'active',

                // With space available
                $where: 'this.users.length <= 6',

                // Check if sponsor is there
                users: {
                    $in: [sponsorOfSponsor]
                },

                blocked: false,

                // Same level
                level: this.level
            };

            if (!this.internal) {
                // If it is not an internal request, skip lists where the
                // same user
                //conditions.users['$nin'] = [this.user];
            }

            this
            .model('list')
            .find(conditions)
            .sort('number')
            .exec()
            .then((docs) => callback(null, docs[0]))
            .catch(MongooseError, callback);
        }];

        let _list = ['_sponsorList', '_sponsorOfSponsorList', (info, callback) => {

            let sponsorList = info._sponsorList;
            let sponsorOfSponsorList = info._sponsorOfSponsorList;

            callback(null, sponsorList || sponsorOfSponsorList);
        }];

        // Update progress
        this.progress = 50;

        // Save to notify and continue
        return this
        .save()
        .then(() => {

            return AutoPromise({
                _user,
                _level,
                _sponsor,
                _sponsorOfSponsor,
                _sponsorList,
                _sponsorOfSponsorList,
                _list
            });
        })
        .then((info) => {

            return !info._list
                ? this.findListForClone(job)
                : info;
        });
    };

    /** Apply business rules to find member list */
    schema.methods.applyBussinessLogicTofindList = function (job) {

        // Create custom errors

        function ListNotFound() {};
        ListNotFound.prototype = Object.create(Error.prototype);

        function NoCredit() {};
        NoCredit.prototype = Object.create(Error.prototype);

        function InsufficientReferrals() {};
        InsufficientReferrals.prototype = Object.create(Error.prototype);

        var user = null;
        var isFirstBuy = false;

        // Return promise

        return this
        .model('user')
        .findById(this.user)
        .exec()
        .then((doc) => {

            Hoek.assert(doc, 'error_user_deleted_externally');
            user = doc;

            return this
            .model('account')
            .count({
                user: this.user,
                level: this.level
            })
            .exec();
        })
        .then((total) => {

            return this
            .model('clone')
            .findOne({
                level: this.level,
                user: this.user
            })
            .exec()
            .then((clone) => {

                return { clone, total };
            });
        })
        .then((data) => {

            let total = data.total;
            let clone = data.clone;
            let count = 0;

            if (clone) {
                count = clone.count;
            }

            isFirstBuy = this.internal || total <= 0;

            if (!isFirstBuy && count < 3) {
                throw new InsufficientReferrals();
            }

            let promise = isFirstBuy
                            ? this.findListForFirstBuy
                            : this.findListForClone;

            return promise.call(this, job);
        })
        .then((info) => {

            if (!info._list) {
                throw new ListNotFound();
            }

            let wallet = info._user.wallet;
            let walletBalance = wallet.balance;

            // If it is internal join, the value to be validated
            // and paid is the netWorth and not the total
            let levelValue = this.internal
                                ? info._level.netWorth
                                : info._level.value;

            // No credit
            if (walletBalance < levelValue) {
                throw new NoCredit();
            }

            // Set value to next then
            info.levelValue = levelValue;

            // Increment referredes before create account
            // Remember that create account can split list
            return this
            .incActiveReferreds(isFirstBuy)
            .then(() => info);
        })
        .then((info) => {

            let levelValue = info.levelValue;
            let Account = this.model('account');
            let account = new Account({
                user: info._user,
                username: this.username,
                list: info._list,
                level: this._level,
                position: info._list.accounts.length + 1
            });

            return account
            .save()
            .then((account) => {

                return {
                    account,
                    levelValue
                };
            });
        })
        .then((info) => {

            return this
            .approve(info.account, info.levelValue, isFirstBuy);
        })
        .catch(ListNotFound, () => {

            return this
            .reject(job, 'join_reject_list_not_found');
        })
        .catch(NoCredit, () => {

            return this
            .reject(job, 'join_reject_no_credit');
        })
        .catch(InsufficientReferrals, () => {

            return this
            .reject(job, 'join_reject_insufficient_referrals');
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

            Hoek.assert(doc, 'error_join_deleted_externally');
            server.publish(_wasNew ? '/join/created' : '/join/updated', doc);
            next();
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
