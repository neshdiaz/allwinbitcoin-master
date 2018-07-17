import Ember from 'ember';

const {
  Logger,
  Service
} = Ember;

export default Service.extend({
  error(error) {
    Logger.error(error);
  },

  debug() {
    Logger.debug(...arguments);
  }
});
