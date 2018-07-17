import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend(BoxCommon, {
  store: service(),
  event: service(),

  classNames: ['user-box'],
  alignToBottom: true,
  openModal: false,

  actions: {
    onChangeFilter(property, value) {
      this.get('event').filter('user', property, value);
    }
  }
});
