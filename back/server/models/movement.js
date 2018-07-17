/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');
const MongooseError = Mongoose.Error;
const MathJS = require('mathjs');


// Declare internals

const internals = {
    MODEL_NAME: 'movement'
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
        movementType: {
            type: String,
            enum: ['payment', 'quick_start_bonus', 'order_balance',
                    'commission', 'transfer', 'transfer_fee', 'order_fee',
                    'retirement', 'retirement_reverse']
        },
        credit: Number,
        debit: Number,
        list: {
            type: ObjectId,
            ref: 'list'
        },
        from: {
            type: String,
            sort: true
        },
        to: {
            type: String,
            sort: true
        }
    });

    schema.pre('find', function () {

        this.populate('list', 'number level');
    });

    schema.pre('findOne', function () {

        this.populate('list', 'number level');
    });

    schema.plugin(server.plugins.mongoose.baseFields);

    schema.post('save', function (movement, next) {

        if (!movement._wasNew) {
            return next();
        }

        let balance = 0;

        if (movement.debit > 0) {
            balance = -movement.debit;
        }

        if (movement.credit > 0) {
            balance = movement.credit;
        }

        this
        .model('wallet')
        .findOneAndUpdate({
            user: movement.user
        }, {
            $inc: { balance }
        })
        .exec()
        .then(() => next())
        .catch(MongooseError, next);
    });

    schema.set('toJSON', { virtuals: false });

    schema.options.toJSON.transform = function (doc, ret) {

        let decimals = server.settings.app.currency.decimals;

        if (ret.debit) {
            ret.debit = MathJS.round(ret.debit, decimals);
        }

        if (ret.credit) {
            ret.credit = MathJS.round(ret.credit, decimals);
        }
    };

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