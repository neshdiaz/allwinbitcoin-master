/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');


// Declare internals

const internals = {
    MODEL_NAME: 'config'
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const schema = new Schema({
        minimumBalanceToCollect: {
            type: Number,
            required: [true, 'error_minimumBalanceToCollect_required']
        },
        transferFee: {
            type: Number,
            required: [true, 'error_transferFee_required']
        },
        orderFee: {
            type: Number,
            required: [true, 'error_orderFee_required']
        },
        currency: {
            type: String,
            required: [true, 'error_currency_required']
        },
        retirementFee: {
            type: Number,
            required: [true, 'error_retirementFee_required']
        },
        lastIndex: {
            type: Number,
            default: 0
        },

        // Retired days

        monday: {
            type: Boolean,
            default: false
        },
        tuesday: {
            type: Boolean,
            default: false
        },
        wednesday: {
            type: Boolean,
            default: false
        },
        thursday: {
            type: Boolean,
            default: false
        },
        friday: {
            type: Boolean,
            default: false
        },
        saturday: {
            type: Boolean,
            default: false
        },
        sunday: {
            type: Boolean,
            default: false
        }
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
