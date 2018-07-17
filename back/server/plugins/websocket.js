/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Lodash = require('lodash');
const Hoek = require('hoek');



exports.register = function (server, options, done) {

    // Set subscriptions

    server.subscription('/event/created');

    server.subscription('/account/created', {
        filter: function (path, doc, options, next) {

            let user = options.credentials;
            let List = Mongoose.model('list');

            if (user.isAdmin) {
                return next(true);
            }

            List.verifyUserInList(doc.list, user, next);
        }
    });

    server.subscription('/list/created', {
        filter: function (path, doc, options, next) {

            let List = Mongoose.model('list');
            let user = options.credentials;

            if (user.isAdmin) {
                return next(true);
            }

            List.verifyUserInList(doc, user, next);
        }
    });
    server.subscription('/list/updated', {
        filter: function (path, doc, options, next) {

            let List = Mongoose.model('list');
            let user = options.credentials;

            if (user.isAdmin) {
                return next(true);
            }

            List.verifyUserInList(doc, user, next);
        }
    });

    server.subscription('/join/created', {
        filter: function (path, doc, options, next) {

            let user = options.credentials;
            return next(user.isAdmin);
        }
    });
    server.subscription('/join/updated', {
        filter: function (path, doc, options, next) {

            let user = options.credentials;
            let createdById = Hoek.reach(doc, 'createdBy');

            if (user.isAdmin) {
                return next(true);
            }

            if (!Mongoose.Types.ObjectId.isValid(createdById)) {
                createdById = Hoek.reach(doc, 'createdBy.id');
            }

            // Notify only if you are the creator
            return next(Lodash.isEqual(user.id, `${createdById}`));
        }
    });

    server.subscription('/transfer/created', {
        filter: function (path, doc, options, next) {

            let user = options.credentials;
            return next(user.isAdmin);
        }
    });
    server.subscription('/transfer/updated', {
        filter: function (path, doc, options, next) {

            let user = options.credentials;
            let createdById = Hoek.reach(doc, 'createdBy');

            if (user.isAdmin) {
                return next(true);
            }

            if (!Mongoose.Types.ObjectId.isValid(createdById)) {
                createdById = Hoek.reach(doc, 'createdBy.id');
            }

            // Notify only if you are the creator
            return next(Lodash.isEqual(user.id, `${createdById}`));
        }
    });

    server.subscription('/order/created', {
        filter: function (path, doc, options, next) {

            let user = options.credentials;
            return next(user.isAdmin);
        }
    });
    server.subscription('/order/updated', {
        filter: function (path, doc, options, next) {

            let user = options.credentials;
            let createdById = Hoek.reach(doc, 'createdBy');

            if (user.isAdmin) {
                return next(true);
            }

            if (!Mongoose.Types.ObjectId.isValid(createdById)) {
                createdById = Hoek.reach(doc, 'createdBy.id');
            }

            // Notify only if you are the creator
            return next(Lodash.isEqual(user.id, `${createdById}`));
        }
    });

    server.subscription('/retirement/created', {
        filter: function (path, doc, options, next) {

            let user = options.credentials;
            return next(user.isAdmin);
        }
    });
    server.subscription('/retirement/updated', {
        filter: function (path, doc, options, next) {

            let user = options.credentials;
            let createdById = Hoek.reach(doc, 'createdBy');

            if (user.isAdmin) {
                return next(true);
            }

            if (!Mongoose.Types.ObjectId.isValid(createdById)) {
                createdById = Hoek.reach(doc, 'createdBy.id');
            }

            // Notify only if you are the creator
            return next(Lodash.isEqual(user.id, `${createdById}`));
        }
    });

    done();
};

exports.register.attributes = {
    name: 'websocker',
    dependencies: 'nes'
};

/* $lab:coverage:on$ */