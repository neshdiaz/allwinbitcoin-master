import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend(BoxCommon, {
  store: service(),
  event: service(),

  classNames: ['admin-message-box'],
  alignToBottom: true,
  openModal: false,

  actions: {
    onFormSuccess(record) {
      this.get('event').notify('admin-message', 'created', record);
    },

    createMessage() {
      this.set('model', this.get('store').createRecord('admin-message'));
      this.set('openModal', true);
    },

    onChangeFilter(property, value) {
      this.get('event').filter('admin-message', property, value);
    }
  }
});
