import Ember from 'ember';
import ListCommon from 'front/mixins/list-common';
import PaginationCommon from 'front/mixins/pagination-common';
import layout from 'front/templates/components/lists/model-list';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend(PaginationCommon, ListCommon, {
  event: service(),
  classNames: ['model-list'],
  layout,
  canSubscribeEvents: true,
  canSubscribeSearch: true,

  init() {
    this._super(...arguments);
    this.get('fetchRecords').perform();

    if (this.get('canSubscribeEvents')) {
      this.subscribeEvents();
    }

    if (this.get('canSubscribeSearch')) {
      this.subscribeSearch();
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    this.unsubscribeEvents();
    this.unsubscribeSearch();
  },

  subscribeSearch() {
    this.get('event').on('form-search',
      this,
      this.execSearch);
  },

  subscribeEvents() {
    this.get('event').on(`${this.get('modelName')}-created`,
      this,
      this.modelCreated);
  },

  unsubscribeSearch() {
    this.get('event').off('form-search',
      this,
      this.execSearch);
  },

  unsubscribeEvents() {
    this.get('event').off(`${this.get('modelName')}-created`,
      this,
      this.modelCreated);
  },

  modelCreated() {
    this.get('fetchRecords').perform();
  }
});
