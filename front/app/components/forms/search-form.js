import Ember from 'ember';
import FormCommon from 'front/mixins/form-common';

const {
  inject: { service },
  Component,
  observer,
  isEmpty,
  isBlank
} = Ember;

export default Component.extend(FormCommon, {
  event: service(),
  classNames: ['search-form'],
  terms: '',
  modelName: '',

  actions: {
    search() {
      let terms = this.get('terms');

      if (isBlank(terms) || isEmpty(terms)) {
        return;
      }

      this.notify(terms);
    }
  },

  termsDidChange: observer('terms', function () {
    let terms = this.get('terms');

    if (isBlank(terms) || isEmpty(terms)) {
      this.notify(null);
    }
  }),

  notify(terms) {
    this.get('event').notify(`${this.get('modelName')}-form`, 'search', terms);
  }
});
