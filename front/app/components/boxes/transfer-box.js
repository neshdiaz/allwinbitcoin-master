import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend(BoxCommon, {
  store: service(),
  event: service(),

  classNames: ['transfer-box'],
  alignToBottom: true,
  openModal: false,

  actions: {
    onFormSuccess(record) {
      this.get('event').notify('transfer', 'created', record);
    },
    createTransfer() {
      let model = this.get('store').createRecord('transfer');
      this.set('model', model);
      this.set('openModal', true);
    }
  }
});
