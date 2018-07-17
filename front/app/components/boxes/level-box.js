import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend(BoxCommon, {
  store: service(),
  event: service(),

  classNames: ['level-box'],
  alignToBottom: true,
  openModal: false,

  actions: {
    onFormSuccess(record) {
      this.get('event').notify('level', 'created', record);
    },

    createLevel() {
      this.set('model', this.get('store').createRecord('level'));
      this.set('openModal', true);
    },

    onChangeFilter(property, value) {
      this.get('event').filter('level', property, value);
    }
  }
});
