import Ember from 'ember';

const {
  tryInvoke,
  Mixin
} = Ember;

export default Mixin.create({
  click() {
    tryInvoke(this, 'onClick', [...arguments]);
  }
});
