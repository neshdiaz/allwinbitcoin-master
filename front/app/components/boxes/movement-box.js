import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
  Component,
} = Ember;

export default Component.extend(BoxCommon, {
  classNames: ['movement-box'],
  alignToBottom: true
});
