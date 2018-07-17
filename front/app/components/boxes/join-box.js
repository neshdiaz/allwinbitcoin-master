import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
  Component
} = Ember;

export default Component.extend(BoxCommon, {
  classNames: ['join-box'],
  alignToBottom: true
});
