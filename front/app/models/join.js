import RequestModel from './request';
import DS from 'ember-data';

const {
  belongsTo
} = DS;

export default RequestModel.extend({
  level: belongsTo('level', { inverse: null }),
  user: belongsTo('user', { inverse: null })
});
