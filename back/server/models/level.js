/* $lab:coverage:off$ */

'use strict';

// Load modules

const Mongoose = require('mongoose');


// Declare internals

const internals = {
    MODEL_NAME: 'level'
};


exports.register = function (server, options, next) {

    const Schema = Mongoose.Schema;
    const schema = new Schema({
        identifier: {
            type: String,
            required: [true, 'error_identifier_required'],
            sort: true
        },
        value: {
            type: Number,
            required: [true, 'error_value_required']
        },
        commission: {
            type: Number,
            required: [true, 'error_commission_required'],
            min: 1,
            max: 100
        },
        quickStartBonus: {
            type: Number,
            required: [true, 'error_quickStartBonus_required']
        },
        abbr: {
            type: String,
            required: [true, 'error_abbr_required'],
            sort: true,
            links: ['list:level', 'request:level']
        }
    });

    schema.virtual('netWorth').get(function () {

        return this.value - (this.value * this.commission / 100);
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