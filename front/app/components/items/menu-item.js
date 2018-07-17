import Ember from 'ember';
import ItemCommon from 'front/mixins/item-common';

const {
  Component
} = Ember;

export default Component.extend(ItemCommon, {
  classNames: ['menu-item']
});
