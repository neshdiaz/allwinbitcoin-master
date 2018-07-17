import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

const {
  Route,
  inject: {
    service
  },
  isEmpty,
  get
} = Ember;

export default Route.extend(ApplicationRouteMixin, {
  session: service(),
  moment: service(),
  i18n: service(),
  websocket: service(),

  beforeModel() {
    return this._loadAppInformation();
  },

  sessionAuthenticated() {
    this._super(...arguments);
    this._loadAppInformation();

    this.get('app')
    .getAdminMessages()
    .then((messages) => {
      if (get(messages, 'length') > 0) {
        this.controllerFor('app').set('showMessages', true);
      }
    });
  },

  sessionInvalidated() {
    this.get('websocket').disconnect();
    return this._super(...arguments);
  },

  _loadAppInformation() {
    return this
    .get('app')
    .load()
    .then((user) => {

      if (isEmpty(user)) {
        return null;
      }

      let language = user.get('language');

      this.set('i18n.locale', language);
      this.get('moment').setLocale(language);
      this.get('websocket').connect();

      return user;
    })
    .catch((err) => {
      this.get('app').handleError(err);
      return err;
    });
  },

  actions: {
    invalidateSession() {
      this.get('session').invalidate();
    }
  }
});
