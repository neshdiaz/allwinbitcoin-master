import Ember from 'ember';

const {
  Component
} = Ember;

export default Component.extend({
  openModal: false,
  tagName: 'button',

  actions: {
    onFormSuccess() {
      this.get('app.reload').perform();
    }
  },

  click() {
    let model = this.get('app.user');

    this.set('model', model);
    this.set('openModal', true);
  }
});
