import ModelList from './model-list';

export default ModelList.extend({
  modelName: 'list',
  classNames: ['list-list'],
  canSubscribeSearch: false,

  subscribeEvents() {
    this._super(...arguments);
    this.get('event').on('account-created',
      this,
      this.accountCreated);
  },

  accountCreated() {
    this.get('fetchRecords').perform();
  },

  unsubscribeEvents() {
    this._super(...arguments);
    this.get('event').off('account-created',
      this,
      this.accountCreated);
  }
});
