import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    level: {
      deserialize: 'records'
    },
    accounts: {
      deserialize: 'records'
    },
    super: {
      deserialize: 'records'
    }
  }
});
