import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    config: {
      deserialize: 'records'
    },
    wallet: {
      deserialize: 'records'
    },
    levels: {
      deserialize: 'records'
    },
    activeLevels: {
      deserialize: 'records'
    }
  }
});
