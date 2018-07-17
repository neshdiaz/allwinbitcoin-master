import MenuItem from './menu-item';
import { task } from 'ember-concurrency';
import Ember from 'ember';

const {
  inject: { service }
} = Ember;

export default MenuItem.extend({
  openModal: false,
  notification: service(),
  store: service(),

  actions: {
    onFormSuccess() {
      this
      .get('notification')
      .alert('title_second_key', 'msg_second_key_generated');
    }
  },

  onClick() {
    this.get('process').perform();
  },

  process: task(function * () {
    let result = yield this.get('notification')
                           .simpleYesNoConfirm('title_confirm_second_key',
                                               'msg_confirm_second_key');
    if (!result) {
      return;
    }

    // Create token and model

    let security = this.get('store').createRecord('security', {
      tokenFor: 'new_second_key'
    });
    let model = this.get('store').createRecord('second-key');

    // Render form

    this.set('model', model);
    this.set('openModal', true);

    yield security.save();
  }).drop()
});
