import ModelItem from './model-item';
import Ember from 'ember';

const {
  inject: { service },
  isEmpty
} = Ember;

export default ModelItem.extend({
  notification: service(),
  classNames: ['referred-item'],

  onClick() {
    const params = {
      referred: this.get('model.id'),
      username: this.get('model.username'),
      email: this.get('model.email'),
      name: this.get('model.name'),
      phone: '',
      country: ''
    };
    const phone = this.get('model.phone');
    const country = this.get('model.country.value');

    if (!isEmpty(phone)) {
      params.phone = phone;
    }

    if (!isEmpty(country)) {
      params.country = country;
    }

    this.get('app.routing').transitionTo('app.referred', null, params);
  }
});
