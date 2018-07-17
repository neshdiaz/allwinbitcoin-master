import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend(BoxCommon, {
  store: service(),
  event: service(),

  classNames: ['admin-retirement-box'],
  alignToBottom: true,
  openModal: false,

  actions: {
    onFormSuccess(record) {
      this.get('event').notify('retirement', 'created', record);
    },

    createRetirement() {
      this.set('model', this.get('store').createRecord('retirement'));
      this.set('openModal', true);
    },

    onChangeFilter(property, value) {
      this.get('event').filter('retirement', property, value);
    }
  }
});
