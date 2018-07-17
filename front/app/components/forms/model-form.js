import Ember from 'ember';
import FormCommon from 'front/mixins/form-common';
import ModelComponentCommon from 'front/mixins/model-component-common';
import { task } from 'ember-concurrency';

const {
  Component,
  tryInvoke
} = Ember;

export default Component.extend(ModelComponentCommon, FormCommon, {
  classNames: ['model-form'],

  getNormalizedModel() {
    let m = this.get('model');

    if (m instanceof Ember.ObjectProxy) {
      m = m.get('content');
    }

    return m;
  },

  save: task(function * () {
    try {
      let m = this.getNormalizedModel();
      let modal = this.get('modal');

      m = yield m.save();
      tryInvoke(this, 'onSave', [m, modal]);
    }
    catch (e) {
      this.get('app').handleError(e);
      tryInvoke(this, 'onError', [e]);
    }
  }).drop()
});
