import DS from 'ember-data';
import Model from './base';

const {
  attr,
  belongsTo
} = DS;

export default Model.extend({
  user: belongsTo('user', { inverse: null }),
  list: belongsTo('list', { inverse: null }),
  level: belongsTo('level', { inverse: null }),
  username: attr('string'),
  position: attr('number')
});
