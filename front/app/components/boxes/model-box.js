import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';
import ModelComponentCommon from 'front/mixins/model-component-common';
import { task } from 'ember-concurrency';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend(ModelComponentCommon, BoxCommon, {
  classNames: ['model-box', 'box'],
  canSubscribeEvents: true,
  event: service(),
  modelDeleted() {},
  afterReload() {},

  init() {
    this._super(...arguments);

    this.set('modelName',
      this.get('model._internalModel.modelName'));

    if (this.get('canSubscribeEvents')) {
      this.subscribeEvents();
    }
  },

  reload: task(function * () {
    try {
      let model = yield this.get('model').reload();

      this.set('model', model);
      this.afterReload(model);
    }
    catch (err) {
      this.get('logger').debug(err);
    }
  }).drop(),

  subscribeEvents() {
    this.get('event').on(`${this.get('modelName')}-updated`,
      this,
      this.modelUpdated);
    this.get('event').on(`${this.get('modelName')}-deleted`,
      this,
      this.modelDeleted);
  },

  modelUpdated() {
    this.get('reload').perform();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.unsubscribeEvents();
  },

  unsubscribeEvents() {
    this.get('event').off(`${this.get('modelName')}-updated`,
      this,
      this.modelUpdated);
    this.get('event').off(`${this.get('modelName')}-deleted`,
      this,
      this.modelDeleted);
  },

  actions: {
    onChangeFilter(property, value) {
      this.get('event').filter(this.get('modelName'), property, value);
    }
  }
});
