'use strict';

const Confidence = require('confidence');
const Config = require('./config');
const Handlebars = require('handlebars');
const Path = require('path');
const Usernames = require('./usernames');


const criteria = {
    env: process.env.NODE_ENV
};


const manifest = {
    $meta: 'This file defines the plot device.',
    server: {
        app: {
            isProduction: criteria.env === 'production',
            env: criteria.env,
            sponsor: {
                email: 'isabel@allwinbitcoin.com',
                username: 'isabel',
                name: 'Isabel Dolores',
                password: '123456',
                passwordConfirmation: '123456',
                country: {
                    id: 'es',
                    value: 'España'
                },
                language: 'es',
                special: true,
                super: true,
                status: 'active'
            },
            usernames: Usernames,
            currency: {
                default: 'BTC',
                decimals: 8
            }
        },
        debug: Config.get('/debug'),
        connections: {
            routes: Config.get('/routes')
        }
    },
    connections: [{
        port: Config.get('/port/api'),
        labels: ['api']
    }],
    registrations: [
        {
            plugin: {
                register: 'good',
                options: {
                    ops: {
                        interval: 1000
                    },
                    reporters: Config.get('/logs/reporters')
                }
            }
        },
        {
            plugin: 'vision'
        },
        {
            plugin: 'inert'
        },
        {
            plugin: {
                register: './server/plugins/_nodemailer',
                options: {
                    transport: Config.get('/mailer/transport'),
                    views: {
                        engines: {
                            html: {
                                module: Handlebars.create(),
                                path: Path.resolve(__dirname, './templates/mails')
                            }
                        }
                    }
                }
            }
        },
        {
            plugin: {
                register: './server/plugins/mailer',
                options: {
                    mailer: Config.get('/mailer'),
                    host: Config.get('/host')
                }
            }
        },
        {
            plugin: {
                register: './server/plugins/mongoose',
                options: Config.get('/mongoose')
            }
        },
        {
            plugin: 'hapi-auth-bearer-token'
        },
        {
            plugin: {
                register: './server/plugins/authentication',
                options: Config.get('/authentication')
            }
        },
        {
            plugin: './server/plugins/handlers'
        },
        {
            plugin: './server/plugins/extensions'
        },
        {
            plugin: 'nes'
        },
        {
            plugin: './server/plugins/websocket'
        },

        // Models

        {
            plugin: './server/models/user'
        },
        {
            plugin: './server/models/wallet'
        },
        {
            plugin: './server/models/account'
        },
        {
            plugin: './server/models/level'
        },
        {
            plugin: './server/models/list'
        },
        {
            plugin: './server/models/admin-list'
        },
        {
            plugin: './server/models/config'
        },
        {
            plugin: './server/models/request'
        },
        {
            plugin: './server/models/retirement'
        },
        {
            plugin: './server/models/join'
        },
        {
            plugin: './server/models/payment'
        },
        {
            plugin: './server/models/movement'
        },
        {
            plugin: './server/models/event'
        },
        {
            plugin: './server/models/order'
        },
        {
            plugin: './server/models/security'
        },
        {
            plugin: './server/models/second-key'
        },
        {
            plugin: './server/models/change-password'
        },
        {
            plugin: './server/models/transfer'
        },
        {
            plugin: './server/models/forgot-password'
        },
        {
            plugin: './server/models/clone'
        },
        {
            plugin: './server/models/admin-message'
        },

        // API

        {
            plugin: {
                register: './server/api/token',
                options: Config.get('/authentication')
            }
        },
        {
            plugin: {
                register: './server/api/activate'
            }
        },
        {
            plugin: './server/api/user',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/account',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/level',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/list',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/sponsor',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/config',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/join',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/event',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/order',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/mycelium'
        },
        {
            plugin: './server/api/movement',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/security',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/second-key',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/change-password',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/transfer',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/retirement',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/forgot-password',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/admin-list',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/clone',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },
        {
            plugin: './server/api/admin-message',
            options: {
                routes: {
                    prefix: Config.get('/host/prefix')
                }
            }
        },

        // Documentation

        {
            plugin: {
                register: 'hapi-swaggered',
                options: {
                    tags: {
                        general: 'General API',
                        auth: 'Authentication API',
                        users: 'Users API',
                        config: 'Config API'
                    },
                    info: {
                        title: 'All Win Bitcoin WEB API',
                        description: 'Powered by unknown',
                        version: '0.1'
                    },
                    tagging: {
                        mode: 'tags'
                    },
                    auth: false
                }
            },
            options: {
                select: 'api'
            }
        },
        {
            plugin: {
                register: 'hapi-swaggered-ui',
                options: {
                    title: 'All Win Bitcoin',
                    path: '/docs',
                    authorization: {
                        field: 'Authorization',
                        scope: 'header',
                        valuePrefix: 'Bearer ',
                        defaultValue: Config.get('/authentication/docsToken'),
                        placeholder: 'Enter your token here'
                    },
                    swaggerOptions: {
                        validatorUrl: null
                    },
                    auth: false
                }
            },
            options: {
                select: 'api'
            }
        },

        // Queues
        {
            plugin: './server/plugins/worker'
        },
        {
            plugin: './server/plugins/join'
        },
        {
            plugin: './server/plugins/transfer'
        },

        // Bootstrap method
        {
            plugin: './server/plugins/bootstrap'
        },
        // PM2
        {
            plugin: {
                register: 'hapi-graceful-pm2',
                options: {
                    timeout: 4000
                }
            }
        }
   ]
};


const store = new Confidence.Store(manifest);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
