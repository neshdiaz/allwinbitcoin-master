export function initialize(application) {
  application.inject('component', 'app', 'service:app');
  application.inject('controller', 'app', 'service:app');
  application.inject('route', 'app', 'service:app');
  application.inject('model', 'app', 'service:app');
}

export default {
  name: 'app',
  initialize
};
