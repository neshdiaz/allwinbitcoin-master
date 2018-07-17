import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend(BoxCommon, {
  store: service(),
  event: service(),

  classNames: ['order-box'],
  alignToBottom: true,
  openModal: false,

  actions: {
    onFormSuccess(record) {
      this.get('event').notify('order', 'created', record);
    },
    createOrder() {
      this.set('model', this.get('store').createRecord('order'));
      this.set('openModal', true);
    }
  }
});
