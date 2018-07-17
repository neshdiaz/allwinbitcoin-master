import MenuItem from './menu-item';
import Ember from 'ember';
import { task } from 'ember-concurrency';

const {
  inject: { service }
} = Ember;

export default MenuItem.extend({
  openModal: false,
  notification: service(),
  store: service(),

  actions: {
    onFormSuccess() {
      this.get('loadUserInfo').perform();
      this
      .get('notification')
      .alert('title_change_password', 'msg_password_updated');
    }
  },

  loadUserInfo: task(function * () {
    yield this.get('app').load();
  }).drop(),

  onClick() {
    let model = this.get('store').createRecord('change-password');
    this.set('model', model);
    this.set('openModal', true);
  }
});
