import Ember from 'ember';
import PaginationCommon from 'front/mixins/pagination-common';
import layout from 'front/templates/components/filters/model-filter';

const {
  Component,
  tryInvoke,
  inject: { service }
} = Ember;

export default Component.extend(PaginationCommon, {
  classNames: ['model-filter'],
  i18n: service(),
  layout,
  all: true,
  selected: null,
  allowClear: true,

  actions: {
    onchange(item) {
      this.set('selected', item);
      tryInvoke(this, 'onchange', [this.get('modelName'), item]);
    }
  },

  didInsertElement() {
    this._super(...arguments);
    this.get('model').clear();
    this.get('fetchRecords').perform();
  }
});
