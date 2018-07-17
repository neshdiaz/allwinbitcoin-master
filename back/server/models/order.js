/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const MyceliumGear = require('mycelium-gear');
const MongooseError = Mongoose.Error;
const Hoek = require('hoek');


// Declare internals

const internals = {
    MODEL_NAME: 'order'
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const ObjectId = Schema.Types.ObjectId;
    const schema = new Schema({
        value: {
            type: Number,
            required: [true, 'error_value_required']
        },
        status: {
            type: String,
            enum: ['pending', 'unconfirmed', 'paid', 'underpaid', 'overpaid',
                    'expired', 'canceled'],
            sort: true,
            default: 'pending'
        },
        date: Date,
        payment_id: String,
        address: String,
        raw_status: Number,
        raw_id: Number,
        keychain_id: String,
        amount_in_btc: {
            type: String,
            sort: true
        },
        amount_to_pay_in_btc: {
            type: String,
            sort: true
        }
    });

    /** Create mycelium order for new records */
    schema.pre('save', true, function (next, done) {

        next();

        if (!this.isNew) {
            return done();
        }

        this.date = new Date();

        // Create Mycelium order

        let gateway = new MyceliumGear.Gateway(
            process.env.GATEWAY_ID,
            process.env.GATEWAY_SECRET
        );

        // Convert to hastoshi to accept BTC
        let __value = this.value * 100000000;
        let order   = new MyceliumGear.Order(gateway, __value, this._id);

        order
        .send()
        .then((response) => response.json())
        .then((json) => {

            this.address = json.address;
            this.payment_id = json.payment_id;
            this.raw_id = json.id;
            this.raw_status = json.status;
            this.amount_in_btc = json.amount_in_btc;
            this.amount_to_pay_in_btc = json.amount_to_pay_in_btc;
            this.keychain_id = json.keychain_id;

            return json;
        })
        .then(() => done())
        .catch((err) => {

            done(err);
        });
    });

    /** Notify to clients */
    schema.post('save', function (doc, next) {

        let _wasNew = doc._wasNew;

        this
        .model(internals.MODEL_NAME)
        .findById(doc)
        .lean()
        .then((doc) => {

            Hoek.assert(doc, 'error_order_deleted_externally');
            server.publish(_wasNew ? '/order/created' : '/order/updated', doc);
            next();
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