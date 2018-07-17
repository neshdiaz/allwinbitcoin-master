import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    user: {
      deserialize: 'records'
    }
  }
});
