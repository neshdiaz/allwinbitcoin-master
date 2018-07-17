import SessionBox from './session-box';
import Ember from 'ember';
import { task } from 'ember-concurrency';

const {
  inject: { service }
} = Ember;

export default SessionBox.extend({
  classNames: ['register-box'],
  session: service(),

  actions: {
    onSuccess(/* model */) {
      // this.get('authenticate').perform(
      //   model.get('email'),
      //   model.get('password')
      // );
      this.get('app.routing').transitionTo('login');
    }
  },

  authenticate: task(function * (identification, password) {
    try {
      yield this.get('session').authenticate('authenticator:oauth2', identification, password);
    }
    catch (error) {
      this.get('app').handleError(error);
    }
  }).drop()
});
