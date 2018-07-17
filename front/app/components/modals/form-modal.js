import Ember from 'ember';
import layout from 'front/templates/components/modals/form-modal';
import { task } from 'ember-concurrency';

const {
  Component,
  assert,
  tryInvoke
} = Ember;

export default Component.extend({
  layout,
  classNames: ['form-modal'],
  closeOnFormSuccess: true,
  reloadOnHide: true,

  onHide() {},

  init() {
    this._super(...arguments);
    assert('Form component is required', this.get('form'));
    this.set('wasSaved', false);
  },

  getNormalizedModel() {
    let m = this.get('model');

    if (m instanceof Ember.ObjectProxy) {
      m = m.get('content');
    }

    return m;
  },

  actions: {
    onFormSuccess(model, modal) {
      tryInvoke(this, 'onFormSuccess', [model, modal]);

      this.set('wasSaved', true);

      if (this.get('closeOnFormSuccess') && modal) {
        modal.close();
      }
    },

    onHide() {
      let wasSaved = this.get('wasSaved');
      let model = this.getNormalizedModel();

      if (this.get('reloadOnHide') && !wasSaved && !model.get('isNew')) {
        model.rollbackAttributes();
        this.get('reloadModel').perform();
      }

      this.onHide(wasSaved);
    },

    onFormError(error, modal) {
      tryInvoke(this, 'onFormError', [error, modal]);
    }
  },

  reloadModel: task(function * () {
    yield this.get('model').reload();
  })
});
