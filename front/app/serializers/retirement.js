import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    creator: {
      deserialize: 'records'
    }
  }
});
