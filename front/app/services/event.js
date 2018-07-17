import Ember from 'ember';

const {
  Service,
  Evented,
  inject: { service }
} = Ember;

export default Service.extend(Evented, {
  logger: service(),

  notify(model, action, data) {
    this.trigger(`${model}-${action}`, data);
    this.get('logger').debug(`${model}-${action}: ${data}`);
  },

  filter(model, property, value) {
    this.trigger(`${model}-filter`, property, value);
    this.get('logger').debug(`${model}-filter: ${property} ${value}`);
  }
});
