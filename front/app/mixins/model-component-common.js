import Ember from 'ember';

const {
  Mixin,
  assert
} = Ember;

export default Mixin.create({
  init() {
    this._super(...arguments);
    assert('Model is required', this.get('model'));
  }
});
