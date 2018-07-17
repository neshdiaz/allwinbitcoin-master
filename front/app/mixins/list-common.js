import Ember from 'ember';

const {
  Mixin,
  tryInvoke
} = Ember;

export default Mixin.create({
  click() {
    tryInvoke(this, 'onClick', [...arguments]);
  }
});
