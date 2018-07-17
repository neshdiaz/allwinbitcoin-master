/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Async = require('async');
const MongooseError = Mongoose.Error;
const Usernames = require('../../usernames');


exports.register = function (server, options, next) {

    const User = Mongoose.model('user');
    const Config = Mongoose.model('config');
    const Level = Mongoose.model('level');
    const List = Mongoose.model('list');
    const Account = Mongoose.model('account');
    const Join = Mongoose.model('join');

    Async.auto({
        config: (callback) => {

            Config
            .findOne()
            .exec()
            .then((config) => {

                if (config) {
                    return callback(null, config);
                }

                Config.create({
                    minimumBalanceToCollect: 0.02,
                    currency: 'BTC',
                    transferFee: 0.00033,       // BTC
                    orderFee: 3,                // %
                    retirementFee: 7,           // %
                    lastIndex: 23
                })
                .then((doc) => callback(null, doc))
                .catch(MongooseError, callback);
            });
        },
        admin: ['config', (data, callback) => {

            User
            .findOne({ isAdmin: true })
            .exec()
            .then((admin) => {

                if (admin) {
                    return admin;
                }

                return User.create({
                    email: 'admin@allwinbitcoin.com',
                    username: 'aguIla',
                    password: '123456',
                    passwordConfirmation: '123456',
                    name: 'Admin All Win Bitcoin',
                    isAdmin: true,
                    language: 'es',
                    country: {
                        id: 'us',
                        value: 'Estados Unidos'
                    },
                    config: data.config,
                    special: true
                });
            })
            .then((doc) => callback(null, doc))
            .catch(callback);
        }],
        levels: (callback) => {

            Level
            .find({})
            .exec()
            .then((levels) => {

                if (levels.length > 0) {
                    callback(null, levels);
                    return null;
                }

                Level.create([
                    {
                        identifier: 'Plan 5mBTC',
                        value: 0.005,
                        commission: 40,
                        quickStartBonus: 0.001,
                        abbr: 'P 0.005'
                    },
                    {
                        identifier: 'Plan 10mBTC',
                        value: 0.01,
                        commission: 40,
                        quickStartBonus: 0.002,
                        abbr: 'P 0.01'
                    },
                    {
                        identifier: 'Plan 20mBTC',
                        value: 0.02,
                        commission: 40,
                        quickStartBonus: 0.004,
                        abbr: 'P 0.02'
                    },
                    {
                        identifier: 'Plan 50mBTC',
                        value: 0.05,
                        commission: 35,
                        quickStartBonus: 0.01,
                        abbr: 'P 0.05'
                    },

                    {
                        identifier: 'Plan 100mBTC',
                        value: 0.1,
                        commission: 35,
                        quickStartBonus: 0.02,
                        abbr: 'P 0.1'
                    },
                    {
                        identifier: 'Plan 200mBTC',
                        value: 0.2,
                        commission: 35,
                        quickStartBonus: 0.04,
                        abbr: 'P 0.2'
                    },
                    {
                        identifier: 'Plan 500mBTC',
                        value: 0.5,
                        commission: 30,
                        quickStartBonus: 0.1,
                        abbr: 'P 0.5'
                    },
                    {
                        identifier: 'Plan 1000mBTC',
                        value: 1,
                        commission: 30,
                        quickStartBonus: 0.2,
                        abbr: 'P 1'
                    }
                ])
                .then((levels) => callback(null, levels))
                .catch(MongooseError, callback);
            })
            .catch(MongooseError, callback);
        },
        lists: ['levels', (data, callback) => {

             List
            .find({})
            .exec()
            .then((lists) => {

                if (lists.length > 0) {
                    callback(null, lists);
                    return null;
                }

                List.create([
                    {
                        level: data.levels[0],
                        status: 'active',
                        blocked: false
                    },
                    {
                        level: data.levels[1],
                        status: 'active',
                        blocked: false
                    },
                    {
                        level: data.levels[2],
                        status: 'active',
                        blocked: false
                    },
                    {
                        level: data.levels[3],
                        status: 'active',
                        blocked: false
                    },
                    {
                        level: data.levels[4],
                        status: 'active',
                        blocked: false
                    },
                    {
                        level: data.levels[5],
                        status: 'active',
                        blocked: false
                    },
                    {
                        level: data.levels[6],
                        status: 'active',
                        blocked: false
                    },
                    {
                        level: data.levels[7],
                        status: 'active',
                        blocked: false
                    }
                ])
                .then((lists) => callback(null, lists))
                .catch(MongooseError, callback);
            })
            .catch(MongooseError, callback);
        }],
        sponsorUser: ['config', 'levels', (data, callback) => {

            let sponsor = server.settings.app.sponsor;

            sponsor.levels = [data.levels[0], data.levels[1],
                                data.levels[2], data.levels[3],
                                data.levels[4], data.levels[5],
                                data.levels[6], data.levels[7]];

            sponsor.activeLevels = [data.levels[0], data.levels[1],
                                data.levels[2], data.levels[3],
                                data.levels[4], data.levels[5],
                                data.levels[6], data.levels[7]];

            User
            .findOne({ super: true })
            .exec()
            .then((user) => {

                if (user) {
                    return callback(null, user);
                }

                User
                .create(sponsor)
                .then((doc) => callback(null, doc))
                .catch(MongooseError, callback);
            })
            .catch(MongooseError, callback);
        }],
        account: ['sponsorUser', 'lists',  (data, callback) => {

            Account
            .findOne()
            .exec()
            .then((account) => {

                if (account) {
                    callback(null, account);
                    return null;
                }

                const payloads = [];
                let index = 0;

                for (let level = 0; level < 8; ++level) {
                    for (let i = 1; i <= 3; ++i) {
                        payloads.push({
                            username: Usernames[index],
                            position: i,
                            list: data.lists[level],
                            user: data.sponsorUser
                        });

                        index++;
                    }
                }

                Account.create(payloads)
                .then((doc) => callback(null, doc))
                .catch(MongooseError, callback);
            })
            .catch(MongooseError, callback);
        }]
        // testingUsers: ['config', 'sponsorUser', (data, callback) => {

        //     if (process.env.NODE_ENV === 'production') {
        //         return callback();
        //     }

        //     const payloads = [];

        //     for (let i = 0; i < 10; ++i) {
        //         payloads.push({
        //             email: `user${i + 1}@gmail.com`,
        //             username: `user${i + 1}`,
        //             password: '123456',
        //             passwordConfirmation: '123456',
        //             name: `user${i + 1}`,
        //             isAdmin: false,
        //             language: 'es',
        //             country: {
        //                 "id": "us",
        //                 "value": "Estados Unidos"
        //             },
        //             status: 'active',
        //             config: data.config,
        //             special: false,
        //             sponsor: data.sponsorUser
        //         });
        //     }

        //     User
        //     .findOne({ username: 'user1' })
        //     .exec()
        //     .then((user) => {

        //         if (user) {
        //             return user;
        //         }

        //         return User
        //         .create(payloads);
        //     })
        //     .then(() => {

        //         callback();
        //         return null;
        //     })
        //     .catch(MongooseError, callback);
        // }]
        // updatePasswordForIsabel: (callback) => {

        //     User
        //     .findOne({
        //         username: 'isabel'
        //     })
        //     .exec()
        //     .then((user) => {

        //         if (!user) {
        //             return null;
        //         }

        //         user.password = '123456';
        //         user.passwordConfirmation = '123456';

        //         return user.save();
        //     })
        //     .then(() => callback())
        //     .catch(MongooseError, callback);
        // }
    }, (err, data) => {

        server.app.CONFIG_ID = data.config._id;
        server.app.SPONSOR = data.sponsorUser.toJSON();
        return next(err);
    });
};


exports.register.attributes = {
    name: 'bootstrap'
};

/* $lab:coverage:on$ */
