import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

const CSS_PAGE = 'register-page';

const {
  Route,
  $,
  RSVP: { Promise },
  isEmpty
} = Ember;

export default Route.extend(UnauthenticatedRouteMixin, {
  activate() {
    $('body').addClass(CSS_PAGE);
  },

  deactivate() {
    $('body').removeClass(CSS_PAGE);
  },

  queryParams: {
    sponsor: {
      refreshModel: false
    }
  },

  model(params) {
    let { sponsor } = params;
    let model = this.store.createRecord('user');

    if (isEmpty(sponsor)) {
      return model;
    }

    return new Promise((resolve) => {
      this
      .store
      .findRecord('sponsor', sponsor)
      .catch(() => resolve(model))
      .then((sponsor) => {

        model.set('sponsor', sponsor);
        resolve(model);
      });
    });
  }
});
