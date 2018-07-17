import Ember from 'ember';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend({
  open: false,
  title: 'Mensajes',
  accept: false,
  session: service(),
  modal: null,

  actions: {
    accept(modal) {
      this.set('accept', true);
      modal.close();
    },

    onHidden() {
      this.set('open', false);
      this.validate();
    }
  },

  validate() {
    if (!this.get('accept')) {
      this.get('session').invalidate();
    }
  }
});
