import Ember from 'ember';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

const CSS_PAGE = 'login-page';

const {
  Route,
  $
} = Ember;

export default Route.extend(UnauthenticatedRouteMixin, {
  activate() {
    $('body').addClass(CSS_PAGE);
  },

  deactivate() {
    $('body').removeClass(CSS_PAGE);
  }
});
