/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'front',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {},
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },
    APP: {},
    host: 'http://localhost:3000',
    homepage: 'http://localhost:4200',
    namespace: 'api/v1',
    authorizer: 'authorizer:application',
    i18n: {
      defaultLocale: 'en'
    },
    moment: {
      outputFormat: 'LL',
      includeLocales: true,
      outputFullFormat: 'MMMM DD YY, h:mm a'
    }
  };

  if (environment === 'qa') {
    ENV.host = 'http://34.228.197.93:3000';
    ENV.homepage = 'http://34.228.197.93';
  }

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'local') {
    ENV.host = 'http://127.0.0.1:3000';
    ENV.homepage = 'http://127.0.0.1:4200';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.host = 'https://ssl.allwinbitcoin.com';
    ENV.homepage = 'https://www.allwinbitcoin.com/';
  }

  ENV['ember-simple-auth'] = {
    authenticationRoute: 'login',
    routeAfterAuthentication: 'app',
    routeIfAlreadyAuthenticated: 'app'
  };

  return ENV;
};
