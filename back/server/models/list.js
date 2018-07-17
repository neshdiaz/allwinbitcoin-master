/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const AutoIncrement = require('mongoose-auto-increment');
const Async = require('async');
const MongooseError = Mongoose.Error;
const Hoek = require('hoek');
const Moment = require('moment');


// Declare internals

const internals = {
    MODEL_NAME: 'list'
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const schema = new Schema({
        status: {
            type: String,
            enum: ['active', 'dividing', 'closed', 'inactive'],
            sort: true
        },
        number: {
            type: Number
        },
        level: {
            type: ObjectId,
            ref: 'level',
            required: [true, 'error_level_required'],
            sort: true,
            identifier: 'abbr'
        },
        accounts: [{
            type: ObjectId,
            ref: 'account'
        }],
        users: [{
            type: ObjectId,
            ref: 'user'
        }],
        super: {
            type: ObjectId,
            ref: 'list'
        },
        __super: String,
        blocked: {
            type: Boolean,
            default: false
        },
        splitDate: Date,
        fromAdmin: {
            type: Boolean,
            default: false
        }
    }, { discriminatorKey: 'kind' });

    schema.pre('find', function () {

        this.populate('level');
        this.populate({
            path: 'accounts',
            options: {
                sort: 'position'
            },
            select: '-list'
        });
        this.populate('super', 'number');
    });

    schema.pre('findOne', function () {

        this.populate('level');
        this.populate({
            path: 'accounts',
            options: {
                sort: 'position'
            },
            select: '-list'
        });
        this.populate('super', 'number');
    });

    schema.pre('save', function (next) {

        if (this.isNew) {
            this.number = new Date().valueOf();
        }

        next();
    });

    /** When the level changes, update all the accounts in the list  */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isModified('level')) {
            return done();
        }

        this.model('account')
        .update({ list: this }, { level: this.level }, { multi: true })
        .exec()
        .then(() => done())
        .catch(MongooseError, done);
    });

    schema.methods.split = function (done) {

        let List = this.model('list');

        this.model('account')
        .find({ list: this })
        .sort('position')
        .exec()
        .then((accounts) => {

            // Normalize filter levels
            accounts = accounts.map((a) => {

                a.user.activeLevels = a.filterLevelsInUser(this.level);
                a.user._activeInThisLevel = a.user.activeLevels.length > 0;

                return a;
            });

            // Check if the lists will be blocked

            let listAisBlocked = false;
            let listBisBlocked = false;

            if (!accounts[1].user._activeInThisLevel &&
                !accounts[3].user._activeInThisLevel &&
                !accounts[4].user._activeInThisLevel) {
                    listAisBlocked = true;
                }

            if (!accounts[2].user._activeInThisLevel &&
                !accounts[5].user._activeInThisLevel &&
                !accounts[6].user._activeInThisLevel) {
                    listBisBlocked = true;
                }

            let accountsA = [
                {
                    user: accounts[1].user,
                    username: accounts[1].username
                },
                {
                    user: accounts[3].user,
                    username: accounts[3].username
                },
                {
                    user: accounts[4].user,
                    username: accounts[4].username
                }
            ];

            let accountsB = [
                {
                    user: accounts[2].user,
                    username: accounts[2].username
                },
                {
                    user: accounts[5].user,
                    username: accounts[5].username
                },
                {
                    user: accounts[6].user,
                    username: accounts[6].username
                }
            ];

            if (!listAisBlocked) {
                if (!accounts[1].user._activeInThisLevel) {
                    // Move to the last position
                    accountsA[2].user = accounts[1].user;
                    accountsA[2].username = accounts[1].username;

                    if (accounts[3].user._activeInThisLevel &&
                        accounts[4].user._activeInThisLevel) {
                        // The one that was first registered, will go to the
                        // collection position
                        let activationDateFor3 = Moment(accounts[3].user.createdAt);
                        let activationDateFor4 = Moment(accounts[4].user.createdAt);

                        if (activationDateFor3.isAfter(activationDateFor4)) {
                            accountsA[0].user = accounts[4].user;
                            accountsA[0].username = accounts[4].username;
                            accountsA[1].user = accounts[3].user;
                            accountsA[1].username = accounts[3].username;
                        }
                        else {
                            accountsA[0].user = accounts[3].user;
                            accountsA[0].username = accounts[3].username;
                            accountsA[1].user = accounts[4].user;
                            accountsA[1].username = accounts[4].username;
                        }
                    }
                    else if (accounts[3].user._activeInThisLevel) {
                        accountsA[0].user = accounts[3].user;
                        accountsA[0].username = accounts[3].username;
                        accountsA[1].user = accounts[4].user;
                        accountsA[1].username = accounts[4].username;
                    }
                    else {
                        accountsA[0].user = accounts[4].user;
                        accountsA[0].username = accounts[4].username;
                        accountsA[1].user = accounts[3].user;
                        accountsA[1].username = accounts[3].username;
                    }
                }
            }

            if (!listBisBlocked) {
                if (!accounts[2].user._activeInThisLevel) {
                    // Move to the last position
                    accountsB[2].user = accounts[2].user;
                    accountsB[2].username = accounts[2].username;

                    if (accounts[5].user._activeInThisLevel &&
                        accounts[6].user._activeInThisLevel) {
                        // The one that was first registered, will go to the
                        // collection position
                        let activationDateFor5 = Moment(accounts[5].user.createdAt);
                        let activationDateFor6 = Moment(accounts[6].user.createdAt);

                        if (activationDateFor5.isAfter(activationDateFor6)) {
                            accountsB[0].user = accounts[6].user;
                            accountsB[0].username = accounts[6].username;
                            accountsB[1].user = accounts[5].user;
                            accountsB[1].username = accounts[5].username;
                        }
                        else {
                            accountsB[0].user = accounts[5].user;
                            accountsB[0].username = accounts[5].username;
                            accountsB[1].user = accounts[6].user;
                            accountsB[1].username = accounts[6].username;
                        }
                    }
                    else if (accounts[5].user._activeInThisLevel) {
                        accountsB[0].user = accounts[5].user;
                        accountsB[0].username = accounts[5].username;
                        accountsB[1].user = accounts[6].user;
                        accountsB[1].username = accounts[6].username;
                    }
                    else {
                        accountsB[0].user = accounts[6].user;
                        accountsB[0].username = accounts[6].username;
                        accountsB[1].user = accounts[5].user;
                        accountsB[1].username = accounts[5].username;
                    }
                }
            }

            Async.auto({
                listA: (callback) => {

                    List.create({
                        level: this.level,
                        status: 'dividing',
                        blocked: listAisBlocked,
                        super: this,
                        __super: this.number
                    })
                    .then((list) => callback(null, list))
                    .catch(MongooseError, callback);
                },
                accountsA: ['listA', (data, callback) => {

                    this.model('account').create([
                        {
                            user: accountsA[0].user,
                            username: accountsA[0].username,
                            list: data.listA,
                            level: this.level,
                            position: 1
                        },
                        {
                            user: accountsA[1].user,
                            username: accountsA[1].username,
                            list: data.listA,
                            level: this.level,
                            position: 2
                        },
                        {
                            user: accountsA[2].user,
                            username: accountsA[2].username,
                            list: data.listA,
                            level: this.level,
                            position: 3
                        },
                    ])
                    .then((accounts) => callback(null, accounts))
                    .catch(MongooseError, callback);
                }],
                listB: (callback) => {

                    List.create({
                        level: this.level,
                        status: 'dividing',
                        blocked: listBisBlocked,
                        super: this,
                        __super: this.number
                    })
                    .then((list) => callback(null, list))
                    .catch(MongooseError, callback);
                },
                accountsB: ['listB', (data, callback) => {

                    this.model('account').create([
                        {
                            user: accountsB[0].user,
                            username: accountsB[0].username,
                            list: data.listB,
                            level: this.level,
                            position: 1
                        },
                        {
                            user: accountsB[1].user,
                            username: accountsB[1].username,
                            list: data.listB,
                            level: this.level,
                            position: 2
                        },
                        {
                            user: accountsB[2].user,
                            username: accountsB[2].username,
                            list: data.listB,
                            level: this.level,
                            position: 3
                        },
                    ])
                    .then((accounts) => callback(null, accounts))
                    .catch(MongooseError, callback);
                }],
                activateListA: ['listA', (data, callback) => {

                    let list = data.listA;

                    list.status = 'active';
                    list.save()
                    .then(() => callback())
                    .catch(MongooseError, callback);
                }],
                activateListB: ['listB', (data, callback) => {

                    let list = data.listB;

                    list.status = 'active';
                    list.save()
                    .then(() => callback())
                    .catch(MongooseError, callback);
                }]
            }, (err) => {

                if (err) {
                    return done(err);
                }

                this.status = 'closed';
                this.splitDate = new Date();
                this.save()
                .then(() => done())
                .catch(MongooseError, done);
            });
        })
        .catch(MongooseError, done);
    };

    /** Check if user is on the list */
    schema.statics.verifyUserInList = function (list, user, callback) {

        this
        .findOne({
            _id: list,
            users: {
                $in: [user]
            },
        })
        .exec()
        .then((list) =>  callback(list ? true : false))
        .catch(() => callback(false));
    };

    /** Websocket support */
    schema.post('save', function (doc, next) {

        let _wasNew = doc._wasNew;

        this
        .model(internals.MODEL_NAME)
        .findById(doc)
        .lean()
        .exec()
        .then((doc) => {

            Hoek.assert(doc, 'error_list_deleted_externally');
            server.publish(_wasNew ? '/list/created' : '/list/updated', doc);
            next();
        })
        .catch(MongooseError, next);
    });

    schema.post('remove', function (list, next) {

        this
        .model('account')
        .remove({ list })
        .then(() => {

            next();
            return null;
        })
        .catch(MongooseError, next);
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
