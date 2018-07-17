/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Hoek = require('hoek');
const MongooseError = Mongoose.Error;


// Declare internals

const internals = {
    MODEL_NAME: 'admin-list'
};


exports.register = function (server, options, next) {

    const List = Mongoose.model('list');
    const Schema = Mongoose.Schema;
    const schema = new Schema({
        user1: {
            type: String,
            required: [true, 'error_user1_required']
        },
        user2: {
            type: String,
            required: [true, 'error_user1_required']
        },
        user3: {
            type: String,
            required: [true, 'error_user1_required']
        }
    }, { discriminatorKey: 'kind' });

    let fields = ['user1', 'user2', 'user3'];

    /** Validate users  */
    fields.forEach((f) => {

        schema.path(f).validate(function (value, callback) {

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
        }, `error_${f}_invalid`);
    });

    /** Create accounts */
    schema.post('save', function (list, next) {

        if (!list._wasNew) {
            return next();
        }

        // Get user 1
        this
        .model('user')
        .findOne({
           $or: [
                {
                    username: list.user1
                },
                {
                    email: list.user1
                }
            ]
        })
        .exec()

        // Create account
        .then((user) => {
            Hoek.assert(user.username, '1')
            Hoek.assert(user, 'error_user_deleted_externally');

            return this
            .model('account')
            .create({
                user,
                list,
                level: list.level,
                position: 1,
                username: user.username
            })
            .then((account) => {

                return { account, user };
            });
        })

        // Update list
        .then((info) => {

            return this
            .model('list')
            .findByIdAndUpdate(list, {
                $addToSet: {
                    accounts: info.account,
                    users: info.user
                }
            })
            .exec();
        })

        // get user 2
        .then(() => {

            return this
            .model('user')
            .findOne({
                $or: [
                        {
                            username: list.user2
                        },
                        {
                            email: list.user2
                        }
                    ]
                })
            .exec();
        })

        // Create account
        .then((user) => {

            Hoek.assert(user, 'error_user_deleted_externally');
            Hoek.assert(user.username, '2')
            return this
            .model('account')
            .create({
                user,
                list,
                level: list.level,
                position: 2,
                username: user.username
            })
            .then((account) => {

                return { account, user };
            });
        })

        // Update list
        .then((info) => {

            return this
            .model('list')
            .findByIdAndUpdate(list, {
                $addToSet: {
                    accounts: info.account,
                    users: info.user
                }
            })
            .exec();
        })

        // Get user 3
        .then(() => {

            return this
            .model('user')
            .findOne({
                $or: [
                        {
                            username: list.user3
                        },
                        {
                            email: list.user3
                        }
                    ]
                })
            .exec();
        })

        // Create account
        .then((user) => {

            Hoek.assert(user, 'error_user_deleted_externally');
            Hoek.assert(user.username, '3')
            return this
            .model('account')
            .create({
                user,
                list,
                level: list.level,
                position: 3,
                username: user.username
            })
            .then((account) => {

                return { account, user };
            });
        })

        // Update list
        .then((info) => {

            return this
            .model('list')
            .findByIdAndUpdate(list, {
                $addToSet: {
                    accounts: info.account,
                    users: info.user
                }
            })
            .exec();
        })

        // Done
        .then(() => {

            next();
            return null;
        })
        .catch(MongooseError, next);
    });

    // Set model
    List.discriminator(internals.MODEL_NAME, schema);

    // Log
    server.log('model', `Model ${internals.MODEL_NAME} loaded.`);

    next();
};


exports.register.attributes = {
    name: `model-${internals.MODEL_NAME}`,
    dependencies: ['mongoose', 'model-list']
};

/* $lab:coverage:on$ */