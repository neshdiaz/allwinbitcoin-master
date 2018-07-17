import ModelBox from './model-box';
import Ember from 'ember';

const {
  inject: { service }, observer
} = Ember;

export default ModelBox.extend({
  classNames: ['list-box'],
  alignToBottom: true,
  logger: service(),

  didInsertElement() {
    this._super(...arguments);
    this.get('reload').perform();
  },

  modelDidChange: observer('model.id', function () {
    this.get('reload').perform();
  }),

  afterReload() {
    this.setAccounts();
  },

  modelCreated() {
    this.get('reload').perform();
  },

  setAccounts() {
    let accounts = this.get('model').get('accounts');

    for (let i = 0; i < 8; ++i) {
      this.set(`account_${i + 1}`, accounts.objectAt(i));
    }
  },

  subscribeEvents() {
    this._super(...arguments);
    this.get('event').on('account-created',
      this,
      this.modelCreated);
  },

  unsubscribeEvents() {
    this._super(...arguments);
    this.get('event').off('account-created',
      this,
      this.modelCreated);
  }
});
