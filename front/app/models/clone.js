import DS from 'ember-data';
import Model from './base';

const {
  attr
} = DS;

export default Model.extend({
  count: attr('number')
});
