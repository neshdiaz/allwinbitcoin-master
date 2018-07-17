import Ember from 'ember';
import SessionBox from './session-box';

const {
  computed: { notEmpty },
  inject: { service }
} = Ember;

export default SessionBox.extend({
  classNames: ['login-box'],
  store: service(),
  hasError: notEmpty('errorMessage').readOnly(),
  openModal: false,

  actions: {
    onFormSuccess() {
      console.log('formSuccess');
    },

    forgotPassword() {
      let model = this.get('store').createRecord('forgot-password');

      this.set('model', model);
      this.set('openModal', true);
    }
  }
});
