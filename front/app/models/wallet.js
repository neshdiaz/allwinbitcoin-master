import DS from 'ember-data';
import Model from './base';

const {
  attr
} = DS;

export default Model.extend({
  balance: attr('number')
});
