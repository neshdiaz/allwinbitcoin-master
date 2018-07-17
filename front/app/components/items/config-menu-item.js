import MenuItem from './menu-item';
import Ember from 'ember';
import { task } from 'ember-concurrency';

const {
  inject: { service }
} = Ember;

export default MenuItem.extend({
  openModal: false,
  store: service(),

  actions: {
    onFormSuccess() {
      this.get('loadUserInfo').perform();
    }
  },

  loadUserInfo: task(function * () {
    yield this.get('app').load();
  }).drop(),

  onClick() {
    let model = this.get('app.user.config').get('content');
    this.set('model', model);
    this.set('openModal', true);
  }
});
