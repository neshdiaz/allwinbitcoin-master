import Ember from 'ember';

const {
  Controller,
  computed,
  isEqual
} = Ember;

export default Controller.extend({
  queryParams: ['sponsor'],
  sponsorError: computed('sponsor', 'model.sponsor.username', {
    get() {
      const sponsor = this.get('sponsor');
      const username = this.get('model.sponsor.username');
      const email = this.get('model.sponsor.email');

      if (isEqual(username, sponsor) || isEqual(email, sponsor)) {
        return false;
      }

      return true;
    }
  })
});
