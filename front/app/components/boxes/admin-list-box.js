import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend(BoxCommon, {
  store: service(),
  event: service(),

  classNames: ['admin-list-box'],
  alignToBottom: true,
  openModal: false,

  actions: {
    onFormSuccess(record) {
      this.get('event').notify('admin-list', 'created', record);
    },

    createList() {
      this.set('model', this.get('store').createRecord('admin-list'));
      this.set('openModal', true);
    },

    onChangeFilter(property, value) {
      this.get('event').filter('admin-list', property, value);
    }
  }
});
