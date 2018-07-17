import Ember from 'ember';
import layout from 'front/templates/components/modals/component-modal';

const {
  Component,
  assert
} = Ember;

export default Component.extend({
  layout,
  classNames: ['component-modal'],

  init() {
    this._super(...arguments);
    assert('Component is required', this.get('component'));
  }
});
