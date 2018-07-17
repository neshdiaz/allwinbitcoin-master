/* $lab:coverage:off$ */

'use strict';

// Load modules

const Jwt = require('jsonwebtoken');
const Mongoose = require('mongoose');


exports.register = function (server, options, done) {

    server.auth.strategy(options.strategyName, 'bearer-access-token', {
        allowQueryToken: false,
        allowMultipleHeaders: false,
        accessTokenName: 'access_token',
        validateFunc: (token, next) => {

            // DOCS API support

            if (process.env.NODE_ENV !== 'production') {
                if (token === options.docsToken) {
                    Mongoose
                    .model('user')
                    .findOne({
                        isAdmin: true
                    })
                    .exec()
                    .then(function (user) {

                        next(null, true, user);
                    });

                    return;
                }
            }

            Jwt.verify(token, options.secret, (err, decoded) => {

                if (err || !decoded) {
                    return next(null, false, {});
                }

                // Get signed document
                const doc = decoded.doc;

                Mongoose
                .model(doc.role || 'user')
                .findById(doc._id)
                .exec()
                .then((user) => {

                    next(null, user ? true : false, user);
                })
                .catch(Mongoose.Error, (err) => {

                    next(null, false);
                });
            });
        }
    });

    // Set default for all routes
    server.auth.default(options.strategyName);

    done();
};

exports.register.attributes = {
    name: 'authentication'
};

/* $lab:coverage:on$ */