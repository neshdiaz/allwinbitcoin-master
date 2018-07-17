import Ember from 'ember';
import ENV from 'front/config/environment';

const {
  Component
} = Ember;

export default Component.extend({
  classNames: ['session-box'],

  actions: {
    goHomePage() {
      window.location.href = ENV.homepage;
    }
  }
});
