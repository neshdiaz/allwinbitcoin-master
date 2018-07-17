import DS from 'ember-data';

const {
  Model,
  attr
} = DS;

export default Model.extend({
  createdAt: attr('date'),
  updateAt: attr('date'),
  tostr: 'undefined'
});
