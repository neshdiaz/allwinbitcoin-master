/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Async = require('async');
const MongooseError = Mongoose.Error;
const Hoek = require('hoek');
const Promise = require('bluebird');
const AutoPromise = Promise.promisify(Async.auto);
const Lodash = require('lodash');


// Declare internals

const internals = {
    MODEL_NAME: 'account'
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
        username: {
            type: String,
            required: [true, 'error_username_required'],
            sort: true
        },
        list: {
            type: ObjectId,
            ref: 'list',
            required: [true, 'error_list_required']
        },
        level: {
            type: ObjectId,
            ref: 'level'
        },
        position: {
            type: Number,
            required: [true, 'error_position_required']
        }
    });

    schema.pre('find', function () {

        this.populate('list level');
        this.populate('user', 'activeLevels');
    });

    schema.pre('findOne', function () {

        this.populate('list level');
        this.populate('user', 'activeLevels');
    });

    /* Filter active levels */
    schema.methods.filterLevelsInUser = function (level) {

        const getId = (val) => val && val._id ? `${val._id}` : `${val}`;
        const id = getId(level);

        let levels = [];

        if (this.populated('user')) {
            levels = this.user.activeLevels;

            if (!levels || !Array.isArray(levels)) {
                levels = [];
            }
        }

        return levels.filter((l) => getId(l) === id);
    };

    /** Set level on create */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isNew) {
            return done();
        }

        this
        .model('list')
        .findById(this.list)
        .exec()
        .then((list) => {

            Hoek.assert(list, 'error_list_deleted_externally');
            this.level = list.level;
            return done();
        })
        .catch(MongooseError, done);
    });

    /** Add account and user to list */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew) {
            return next();
        }

        this
        .model('list')
        .findByIdAndUpdate(doc.list, {
            $addToSet: {
                accounts: doc,
                users: doc.user
            }
        }).exec()
        .then(() => next())
        .catch(MongooseError, next);
    });

    /** Notify to clients */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew) {
            return next();
        }

        this
        .model(internals.MODEL_NAME)
        .findById(doc)
        .lean()
        .exec()
        .then((result) => {

            Hoek.assert(result, 'error_account_deleted_externally');
            server.publish('/account/created', result);
            next();
        })
        .catch(MongooseError, next);
    });

    /** Check and divide the list if it is the last position */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew || doc.position !== 7) {
            return next();
        }

        this
        .model('list')
        .findById(this.list)
        .exec()
        .then((list) => {

            Hoek.assert(list, 'error_list_deleted_externally');
            list.split(next);
        })
        .catch(MongooseError, next);
    });

    /** Increment activeReferreds to user */
    schema.post('save', function (doc, next) {

        if (!doc._wasNew) {
            return next();
        }

        // Get sponsor
        this
        .model('user')
        .findById(doc.user)
        .populate('sponsor')
        .exec()
        .then((user) => {

            const sponsor = Hoek.reach(user, 'sponsor');

            if (!sponsor) {
                server.log('warn',
                            `User "${user.username}" don't have sponsor`);
                return next();
            }

            const incrementActiveReferreds = (callback) => {

                this
                .model('user')
                .findByIdAndUpdate(sponsor, {
                    $addToSet: {
                        activeReferredsList: user
                    }
                })
                .exec()
                .then(() => callback())
                .catch(MongooseError, callback);
            };

            const assignLevelToUser = (callback) => {

                this
                .model('user')
                .findByIdAndUpdate(this.user, {
                    $addToSet: {
                        levels: this.level
                    }
                })
                .exec()
                .then(() => callback())
                .catch(MongooseError, callback);
            };

            Async.parallel([
                incrementActiveReferreds,
                assignLevelToUser
            ], next);
        })
        .catch(MongooseError, next);
    });

    /** If the position is number 6, cycle the user
     * who are in the recovery position */
    schema.methods.validateCycling = function () {

        if (this.position !== 6) {
            return;
        }

        const _firstAccount = (callback) => {

            this
            .model('account')
            .findOne({
                list: this.list,
                position: 1
            })
            .exec()
            .then((doc) => callback(null, doc))
            .catch(MongooseError, callback);
        };

        const _join = ['_firstAccount', (info, callback) => {

            const account = info._firstAccount;
            Hoek.assert(account, 'error_account_deleted_externally');

            const user = account.user;
            Hoek.assert(user, 'error_user_deleted_externally');

            this
            .model('join')
            .create({
                internal: true,
                level: this.level,
                user,

                // As it is cycling keep the same username
                username: account.username
            })
            .then(() => callback())
            .catch(MongooseError, callback);
        }];

        return AutoPromise({
            _firstAccount,
            _join
        });
    };

    /**
     * Find sponsor lists that are blocked and activate them as
     * applicable
     */
    schema.post('save', function (account, next) {

        if (!account._wasNew) {
            return next();
        }

        const _user = (callback) => {

            this
            .model('user')
            .findById(account.user)
            .exec()
            .then((doc) => callback(null, doc))
            .catch(MongooseError, callback);
        };

        const _sponsor = ['_user', (info, callback) => {

            const user = info._user;
            Hoek.assert(user, 'error_user_deleted_externally');

            const sponsor = user.sponsor;

            if (!sponsor) {
                return callback();
            }

            this
            .model('user')
            .findById(sponsor)
            .exec()
            .then((doc) => callback(null, doc))
            .catch(MongooseError, callback);
        }];

        const _blockedLists = ['_sponsor', (info, callback) => {

            const sponsor = info._sponsor;
            const getId = (val) => val && val._id ? `${val._id}` : `${val}`;

            if (!sponsor) {
                return callback();
            }

            // Apply this only if sponsor is active on this
            // level
            const isActive = sponsor.activeLevels.find((l) => {

                return Lodash.isEqual(getId(l), getId(account.level));
            });

            if (!isActive) {
                return callback(null, []);
            }

            this
            .model('list')
            .find({
                blocked: true,

                users: {
                    $in: [sponsor]
                },
                // Enable on account level
                level: account.level
            })
            .sort('number')
            .exec()
            .then((docs) => callback(null, docs))
            .catch(MongooseError, callback);
        }];

        const _lists = ['_blockedLists', '_sponsor', (info, callback) => {

            const lists = info._blockedLists;
            const sponsor = info._sponsor;

            if (!sponsor) {
                // TODO: check if is a real super sponsor
                return callback();
            }

            let processList = (list, callback) => {

                let _firstAccount = (callback) => {

                    this
                    .model('account')
                    .findOne({
                        list,
                        position: 1
                    })
                    .exec()
                    .then((doc) => callback(null, doc))
                    .catch(MongooseError, callback);
                };

                let _sponsorAccount = (callback) => {

                    this
                    .model('account')
                    .findOne({
                        list,
                        user: sponsor
                    })
                    .exec()
                    .then((doc) => callback(null, doc))
                    .catch(MongooseError, callback);
                };

                let interchange = ['_firstAccount', '_sponsorAccount', (info, callback) => {

                    let firstAccount = info._firstAccount;
                    let sponsorAccount = info._sponsorAccount;

                    Hoek.assert(firstAccount, 'error_account_deleted_externally');
                    Hoek.assert(sponsorAccount, 'error_account_deleted_externally');

                    if (sponsorAccount.position === 1) {
                        return callback();
                    }

                    firstAccount.position = sponsorAccount.position;
                    sponsorAccount.position = 1;

                    let updateFirstAccount = (callback) => {

                        firstAccount.save()
                        .then(() => callback())
                        .catch(MongooseError, callback);
                    };

                    let updateSponsorAccount = (callback) => {

                        sponsorAccount.save()
                        .then(() => callback())
                        .catch(MongooseError, callback);
                    };

                    Async.parallel([
                        updateFirstAccount,
                        updateSponsorAccount
                    ], callback);
                }];

                let activateList = (err) => {

                    if (err) {
                        return callback(err);
                    }

                    list.blocked = false;
                    list.save()
                    .then(() => callback())
                    .catch(MongooseError, callback);
                };

                Async.auto({
                    _firstAccount,
                    _sponsorAccount,
                    interchange,
                }, activateList);
            };

            Async.each(
                lists,
                processList,
                callback
            );
        }];

        Async.auto({
            _user,
            _sponsor,
            _blockedLists,
            _lists
        }, next);
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
