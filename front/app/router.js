import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('app', function() {
    this.route('list', { path: '/list/:list_id' });
    this.route('referred', { path: '/referred/list' });
    this.route('contact');
    this.route('joins');
    this.route('orders');
    this.route('transfers');
    this.route('retirements');
    this.route('movements');
    this.route('admin', function () {
      this.route('lists');
      this.route('levels');
      this.route('retirements');
      this.route('users');
      this.route('messages');
    });
  });
  this.route('login');
  this.route('register');
});

export default Router;
