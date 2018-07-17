import ModelItem from './model-item';
import Ember from 'ember';
import { task } from 'ember-concurrency';

const {
  computed,
  inject: { service }
} = Ember;

export default ModelItem.extend({
  notification: service(),
  store: service(),
  app: service(),

  classNames: ['level-item'],
  classNameBindings: ['enabled::disabled'],
  sort: 'value',
  sortDir: 'asc',

  onClick() {
    if (!this.get('enabled')) {
      return;
    }

    this
    .get('joinLevel')
    .perform(this.get('model'));
  },

  init() {
    this._super(...arguments);
    this.get('getClones').perform();
  },

  joinLevel: task(function * (level) {
    let result = yield this
                      .get('notification')
                      .simpleYesNoConfirm('title_confirm_join_level', 'msg_confirm_join_level');

    if (!result) {
      return;
    }

    yield this.get('app').get('joinLevel').perform(level);
  }).drop(),

  getClones: task(function * () {
    try {
      const clone = yield this.get('store').queryRecord('clone',{
        level: this.get('model.id')
      });
      this.set('clones', clone.get('count'));
    }
    catch (e) {
      this.set('clones', 0);
    }

  }).drop(),

  enabled: computed(
    'clones',
    'app.user.levels.[]',
    'app.user.wallet.balance',
    'model.value', {

    get() {
      const levels = this.get('app.user.levels');
      const isInThisLevel = levels && levels.findBy('id', this.get('model.id'));

      if (!isInThisLevel) {
        return true;
      }

      const balance = this.get('app.user.wallet.balance');
      const clones = this.get('clones');

      return (clones >= 3 && balance >= this.get('model.value'));
    }
  })
});
