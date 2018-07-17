import Ember from 'ember';
import layout from 'front/templates/components/pages/model-page';

const {
  Component,
  inject: {
    service
  },
  assert,
  tryInvoke
} = Ember;

export default Component.extend({
  layout,
  store: service(),
  event: service(),
  classNames: ['model-page'],
  modelProperties: {},
  openModal: false,
  notifyModelCreated: false,

  init() {
    this._super(...arguments);
    assert('Model name is required', this.get('modelName'));
  },

  actions: {
    add() {
      let modelName = this.get('modelName');
      let model = this.get('store').createRecord(modelName,
                  this.get('modelProperties'));

      this.set('model', model);
      this.set('openModal', true);
    },

    onFormSuccess(model) {
      if (this.get('notifyModelCreated')) {
        this.get('event').notify(this.get('modelName'), 'created', model);
      }
    },

    onFormError(model, modal) {
      tryInvoke(this, 'onFormError', [model, modal]);
    }
  }
});
