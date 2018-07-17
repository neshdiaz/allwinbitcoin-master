import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    list: {
      deserialize: 'records'
    },
    level: {
      deserialize: 'records'
    },
    user: {
      deserialize: 'records'
    }
  }
});
