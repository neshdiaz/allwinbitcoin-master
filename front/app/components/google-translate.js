/* global google */
import Ember from 'ember';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend({
  translate: service(),

  init() {
    this._super(...arguments);
    this.get('translate').load();
  }
});
