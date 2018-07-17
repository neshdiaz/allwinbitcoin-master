import Ember from 'ember';
import FormCommon from 'front/mixins/form-common';
import { task } from 'ember-concurrency';

const {
  inject: { service },
  Component,
  typeOf,
  tryInvoke
} = Ember;

export default Component.extend(FormCommon, {
  session: service('session'),
  classNames: ['login-form'],
  openModal: false,

  authenticate: task(function * () {
    try {
      let { identification, password } = this.getProperties('identification', 'password');
      yield this.get('session').authenticate('authenticator:oauth2', identification, password);
    }
    catch (reason) {
      const error = typeOf(reason) === 'undefined' ?
                    'error_no_connection' :
                    reason.error;
      tryInvoke(this, 'onError', [error]);
      this.putFocus();
    }
  }).restartable(),

  putFocus() {
    this.$().find('input[type="email"]').select().focus();
  }
});
