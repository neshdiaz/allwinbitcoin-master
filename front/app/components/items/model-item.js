import Ember from 'ember';
import ItemCommon from 'front/mixins/item-common';
import ModelComponentCommon from 'front/mixins/model-component-common';

const {
  Component,
  tryInvoke
} = Ember;

export default Component.extend(ModelComponentCommon, ItemCommon, {
  classNames: ['model-item'],

  /** Override */
  click() {
    tryInvoke(this, 'onClick', [this.get('model'), ...arguments]);
  }
});
