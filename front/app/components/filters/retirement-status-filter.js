import ModelFilter from './model-filter';
import Ember from 'ember';
import retirementStatus from 'front/fixtures/retirement-status';

const {
  computed
} = Ember;

export default ModelFilter.extend({
  options: retirementStatus,
  modelName: 'status',

  placeholder: computed('i18n.locale', {
    get() {
      return this.get('i18n').t('prompt_status_filter');
    }
  }),

  // Don't do anything
  didInsertElement() {}
});
