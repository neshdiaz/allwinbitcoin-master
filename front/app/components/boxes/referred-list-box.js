import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend(BoxCommon, {
  classNames: ['referred-list-box'],
  event: service(),
  alignToBottom: true,

  actions: {
    onChangeFilter(property, value) {
      this.get('event').filter('list', property, value);
    }
  }
});
