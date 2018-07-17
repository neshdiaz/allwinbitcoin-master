import ModelForm from './model-form';
import { task } from 'ember-concurrency';
import Ember from 'ember';
import listStatus from 'front/fixtures/list-status';

const {
  inject: { service }
} = Ember;

export default ModelForm.extend({
  levels: [],
  store: service(),
  listStatus,

  init() {
    this._super(...arguments);
    this.get('loadLevels').perform();
  },

  loadLevels: task(function * () {
    try {
      let levels = yield this.get('store').query('level', {
        all: true,
        sort: 'value',
        sortDir: 'asc'
      });
      this.set('levels', levels);
    }
    catch (e) {
      this.get('app').handleError(e);
    }
  }).drop()
});
