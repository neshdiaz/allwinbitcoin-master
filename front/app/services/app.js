import Ember from 'ember';
import { task } from 'ember-concurrency';
import moment from 'moment';

const {
  inject: { service },
  isEmpty,
  RSVP,
  Service,
  computed
} = Ember;

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export default Service.extend({
  session: service(),
  store: service(),
  event: service(),
  notification: service(),
  i18n: service(),
  logger: service(),
  routing: service('-routing'),
  user: { isAdmin: false },
  isLoading: false,
  adminMessages: [],

  load() {
    this.set('isLoading', true);

    return new RSVP.Promise((resolve, reject) => {
      let userId = this.get('session.data.authenticated.user_id');

      if (!isEmpty(userId)) {
        return this
        .get('store')
        .findRecord('user', userId)
        .then((user) => {
          this.set('user', user);

          // Notify change
          this.notifyPropertyChange('user');

          this.set('isLoading', false);
          return resolve(user);
        }, reject);
      }
      else {
        this.set('isLoading', false);
        return reject();
      }
    });
  },

  getAdminMessages() {
    return new RSVP.Promise((resolve, reject) => {
        this
        .get('store')
        .query('admin-message', { sort: 'createdAt', sortDir: 'desc' })
        .then((messages) => {
          this.set('adminMessages', messages);

          // Notify change
          this.notifyPropertyChange('adminMessages');

          return resolve(messages);
        }, reject);
      }
    );
  },

  handleError(error) {
    this.get('logger').error(error);
  },

  actions: {
    onAccountItemClick(item) {
      this.get('routing').transitionTo('app.list', [item.get('list')]);
    },

    pending() {
      return alert(this.get('i18n').t('action_pending'));
    }
  },

  isValidDayForRetirement: computed('user.config', {
    get() {
      const day = moment().isoWeekday() - 1;
      const prop = DAYS[day];

      return this.get(`user.config.${prop}`);
    }
  }),

  // Bussiness logic

  joinLevel: task(function * (level) {
    try {
      let user = this.get('user');
      let request = this.get('store').createRecord('join', {
        user, level
      });

      request = yield request.save();

      yield this.load();

      this.get('event').notify('join', 'created', request);
      this.get('notification').success('title_request_created', 'msg_request_created');
    }
    catch (error) {
      this.handleError(error);
    }
  }).enqueue(),

  reload: task(function * () {
    yield this.load();
  }).enqueue()
});
