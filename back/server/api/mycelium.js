/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const Hoek = require('hoek');
const Boom = require('boom');
const JsSHA = require('jssha');
const TextEncoder = require('text-encoding').TextEncoder;
const Promise = require('bluebird');


// Declare internals

const internals = {};


exports.register = function (server, options, next) {

    // Custom errors

    const NoOrder = function () {};
    NoOrder.prototype = Object.create(Error.prototype);

    const NoPaid = function () {};
    NoPaid.prototype = Object.create(Error.prototype);

    // Models

    const Order = Mongoose.model('order');
    const Movement = Mongoose.model('movement');
    const User = Mongoose.model('user');
    const Config = Mongoose.model('config');

    server.route({
        method: 'GET',
        path: '/payments/callback',
        handler(request, reply) {

            const headers = request.raw.req.headers;
            const data = request.query;
            const status = data.status;
            //const orderId = data.order_id;            // mycelium order
            const awbOrderId = data.callback_data;    // Allwinbitcoin order
            const amount = data.amount_in_btc;
            const xSignature = Hoek.reach(headers, 'x-signature');
            const method = 'GET';

            let sha512 = new JsSHA('SHA-512', 'TEXT');
            sha512.update('');

            const constant_digest = sha512.getHash('ARRAYBUFFER');
            const _request = method + request.url.path;

            sha512 = new JsSHA('SHA-512', 'ARRAYBUFFER');
            sha512.setHMACKey(process.env.GATEWAY_SECRET, 'TEXT');
            sha512.update(new TextEncoder('UTF-8').encode(_request));
            sha512.update(constant_digest);

            const signature = sha512.getHMAC('B64');

            if (signature !== xSignature) {
                return reply(Boom.badRequest());
            }

            Order
            .findById(awbOrderId)
            .exec()
            .then((order) => {

                if (!order) {
                    throw new NoOrder();
                }

                const myceliumStatus = ['pending', 'unconfirmed', 'paid',
                    'underpaid', 'overpaid', 'expired',
                    'canceled'];

                order.raw_status = status;
                order.status = myceliumStatus[status];

                return order.save();
            })
            .then((order) => {

                if (order.status !== 'paid') {
                   throw new NoPaid();
                }

                return Config
                .findOne()
                .exec()
                .then((config) => {

                    Hoek.assert(config, 'error_config_deleted_externally');
                    return { order, config };
                });
            })
            .then((info) => {

                const order = info.order;

                return User
                .findById(order.createdBy)
                .exec()
                .then((createdBy) => {

                    Hoek.assert(createdBy, 'error_user_deleted_externally');
                    info.createdBy = createdBy;

                    return info;
                });
            })
            .then((info) => {

                const order = info.order;
                const createdBy = info.createdBy;
                const config = info.config;
                const commission = order.amount_in_btc * config.orderFee / 100;

                const orderFee = () => {

                    return Movement
                    .create({
                        user: createdBy,
                        movementType: 'order_fee',
                        debit: commission
                    });
                };

                const orderFeeCredit = () => {

                    return User
                    .findOne({
                        super: true
                    })
                    .exec()
                    .then((sponsor) => {

                        Hoek.assert(sponsor,
                                    'error_super_sponsor_deleted_externally');

                        return Movement
                        .create({
                            user: sponsor,
                            movementType: 'order_fee',
                            credit: commission,
                            from: createdBy.username
                        });
                    });
                };

                const orderBalance = () => {

                    return Movement
                    .create({
                        user: createdBy,
                        movementType: 'order_balance',
                        credit: order.amount_in_btc
                    });
                };

                const tasks = [];

                tasks.push(orderBalance());
                tasks.push(orderFee());
                tasks.push(orderFeeCredit());

                return Promise
                .all(tasks);
            })
            .then(() => {

                reply();
                return null;
            })
            .catch(NoOrder, () => reply({}))
            .catch(NoPaid, () => reply({}))
            .catch(reply);
        },
        config: {
            auth: false
        }
    });

    next();
};


exports.register.attributes = {
    name: 'api-mycelium'
};

/* $lab:coverage:on$ */
