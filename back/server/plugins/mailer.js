/* $lab:coverage:off$ */

'use strict';

// Load modules

const Hoek = require('hoek');


// Declare internals

const internals = {};


exports.register = function (server, options, next) {

    const helpers = {};

    helpers.send = (data, callback) => {

        Hoek.merge(data, { from: options.mailer.from });
        Hoek.merge(data.context, { host: options.host });

        server.plugins['_nodemailer'].send(data, (err, info) => {

            server.log('mailer', err || info);
            return callback(err, info);
        });
    };

    server.expose(helpers);

    next();
};


exports.register.attributes = {
    name: 'mailer',
    dependencies: ['_nodemailer']
};

/* $lab:coverage:on$ */
