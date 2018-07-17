'use strict';

const Confidence = require('confidence');
const Uuid = require('node-uuid');


const criteria = {
    env: process.env.NODE_ENV,
    domain: 'allwinbitcoin.com',
    database: 'allwinbitcoin'
};


const config = {
    $meta: 'Allwinbitoin server config',
    projectName: 'back',
    port: {
        api: {
            $filter: 'env',
            test: 9090,
            $default: 3000
        }
    },
    debug: {
        $filter: 'env',
        test: {},
        $default: {
            request: ['error']
        }
    },
    logs: {
        reporters: {
            $filter: 'env',
            test: {},
            $default: {
                console: [
                    {
                        module: 'good-squeeze',
                        name: 'Squeeze',
                        args: [{ log: '*', response: '*' }]
                    },
                    {
                        module: 'good-console'
                    },
                    'stdout'
                ],
                file: [
                    {
                        module: 'good-squeeze',
                        name: 'Squeeze',
                        args: [{ log: ['error', 'warn', 'auth', 'mailer'] }]
                    },
                    {
                        module: 'good-squeeze',
                        name: 'SafeJson'
                    },
                    {
                        module: 'good-file',
                        args: ['./fixtures/logs']
                    }
                ]
            }
        }
    },
    host: {
        prefix: '/api/v1',
        client: {
            $filter: 'env',
            production: `http://office.${criteria.domain}`,
            qa: 'http://34.228.197.93',
            $default: 'http://localhost:4200'
        },
        server: {
            $filter: 'env',
            production: `http://ssl.${criteria.domain}`,
            qa: 'http://34.228.197.93:3000',
            $default: 'http://localhost:3000'
        }
    },
    routes: {
        security: true,
        cors: {
            origin: {
                $filter: 'env',
                production: ['*'],
                qa: ['*'],
                $default: ['*']
            }
        }
    },
    mongoose: {
        uri: {
            $filter: 'env',
            production: `mongodb://127.0.0.1/${criteria.database}`,
            qa: `mongodb://127.0.0.1/${criteria.database}-qa`,
            test: `mongodb://127.0.0.1/${criteria.database}-test`,
            $default: `mongodb://127.0.0.1/${criteria.database}-dev`
        }
    },
    authentication: {
        secret: {
            $filter: 'env',
            production: process.env.API_SECRET,
            $default: 'secret'
        },
        refreshSecret: {
            $filter: 'env',
            production: process.env.API_REFRESH_SECRET,
            $default: 'refreshSecret'
        },
        expiresIn: {
            $filter: 'env',
            production: 20 * 60,
            $default: 60 * 60
        },
        activateUserToken: {
            $filter: 'env',
            production: process.env.API_ACTIVATE_SECRET,
            $default: 'activateSecret'
        },
        strategyName: 'jwt',
        docsToken: Uuid.v4()
    },
    mailer: {
        transport: {
            host: 'smtp.sendgrid.net',
            auth: {
                user: 'awb2',
                pass: 'Sender$2'
            },
            secure: true,
            port: 465
        },
        from: {
            $filter: 'env',
            qa: `"AllWinBitcoin" <no-reply@${criteria.domain}>`,
            production: `"AllWinBitcoin" <no-reply@${criteria.domain}>`,
            $default: `"AllWinBitcoin" <no-reply@${criteria.domain}>`
        }
    }
};


const store = new Confidence.Store(config);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
