/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    lessOptions: {
      paths: [
        'bower_components/AdminLTE/build/less'
      ]
    },

    // 'ember-power-select': {
    //   theme: 'bootstrap'
    // },

    'ember-bootstrap-datetimepicker': {
      importBootstrapCSS: false,
      importBootstrapJS: false,
      importBootstrapTheme: false
    },

    'ember-bootstrap': {
      'bootstrapVersion': 3,
      'importBootstrapFont': true,
      'importBootstrapCSS': false
    }
  });

  app.import('bower_components/bootstrap/dist/js/bootstrap.js');
  app.import('bower_components/bootstrap/dist/css/bootstrap.css');
  app.import('bower_components/socket.io-client/dist/socket.io.js');
  app.import('bower_components/nprogress/nprogress.js');
  app.import('bower_components/nprogress/nprogress.css');

  // jquery confirm 2
  app.import('bower_components/jquery-confirm2/js/jquery-confirm.js');
  app.import('bower_components/jquery-confirm2/css/jquery-confirm.css');

  return app.toTree();
};
