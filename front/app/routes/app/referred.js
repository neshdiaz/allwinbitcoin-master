import Ember from 'ember';

const {
  Route
} = Ember;

export default Route.extend({
  queryParams: {
    referred: {
      refreshModel: false
    },
    username: {
      refreshModel: false
    },
    email: {
      refreshModel: false
    },
    phone: {
      refreshModel: false
    },
    country: {
      refreshModel: false
    },
    name: {
      refreshModel: false
    }
  }
});
