import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    level: {
      deserialize: 'records'
    }
  }
});
