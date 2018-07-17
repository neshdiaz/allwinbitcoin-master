import ModelFilter from './model-filter';
import Ember from 'ember';

const {
  computed
} = Ember;

export default ModelFilter.extend({
  modelName: 'level',
  sort: 'value',
  sortDir: 'asc',
  searchField: 'name',
  property: 'toStr',
  placeholder: computed('i18n.locale', {
    get() {
      return this.get('i18n').t('prompt_level_filter');
    }
  })
});
