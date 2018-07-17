import Ember from 'ember';
import { task } from 'ember-concurrency';
import DS from 'ember-data';

const {
  Mixin,
  inject: { service },
  computed,
  merge,
  isEmpty,
  assert,
  get,
  set
} = Ember;

export default Mixin.create({
  store: service(),
  isLoading: computed.oneWay('fetchRecords.isRunning'),
  page: 1,
  limit: 24,
  sort: '',
  sortDir: 'asc',
  all: true,
  search: null,
  filters: computed(function () {
    return {};
  }),

  /*** Override this method to handle new model data */
  onFetchRecords() {},

  params: computed('search', 'page', 'limit', 'sort', 'sortDir', 'all', {
    get() {
      return this.getProperties('search', 'page', 'limit', 'sort',
                                'sortDir', 'all');
    }
  }).volatile(),

  init() {
    this._super(...arguments);

    assert('Model name is required', this.get('modelName'));

    let {
      model, meta
    } = this.attrs;

    if (!isEmpty(model)) {
      if (isEmpty(meta)) {
        this.set('meta', {});
      }

      return;
    }

    this.setProperties({
      model: Ember.A([]),
      meta: {}
    });
  },

  fetchRecords: task(function * () {
    try {
      // Get all params
      let { filters, params } = this.getProperties('filters', 'params');

      // Normalize filters
      for (let key in filters) {
        let value = get(filters, key);

        if (value instanceof Ember.ObjectProxy) {
          value = value.get('content');
        }

        if (value instanceof DS.Model) {
          value = get(value, 'id');
          set(filters, key, value);
        }
      }

      let records = yield this.get('store').query(
        this.get('modelName'),
        merge(params, filters)
      );
      let meta = records.get('meta');
      let model = this.get('model');

      records = records.toArray().filter((r) => {
        let exists = model.findBy('id', r.get('id'));
        return !exists;
      });

      this.set('meta', meta);

      model.pushObjects(records);
      this.onFetchRecords(model);
    }
    catch (err) {
      this.get('app').handleError(err);
    }
  }).drop(),

  loadMore: task(function * () {
    if (!this.get('meta.haveMoreRecords')) {
      return;
    }

    if (this.get('isLoading')) {
      return;
    }

    this.incrementProperty('page');
    yield this.get('fetchRecords').perform();
  }).drop(),

  execSearch(terms) {
    this.setProperties({
      search: terms,
      page: 1
    });
    this.get('model').clear();
    this.get('fetchRecords').perform();
  },

  refresh: task(function * () {
    yield this.get('fetchRecords').perform();
  }).drop()
});
