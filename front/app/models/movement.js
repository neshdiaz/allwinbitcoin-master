import DS from 'ember-data';
import Model from './base';
import Ember from 'ember';

const {
  attr,
  belongsTo
} = DS;

const {
  computed
} = Ember;

export default Model.extend({
  user: belongsTo('user', { inverse: null }),
  movementType: attr('string'),
  credit: attr('number'),
  debit: attr('number'),
  list: belongsTo('list', { inverse: null }),
  from: attr('string'),
  to: attr('string'),

  typeCSS: computed('debit', 'credit', {
    get() {
      let debit = this.get('debit');
      let credit = this.get('credit');

      if (credit > 0) {
        return 'success';
      }
      else if (debit > 0) {
        return 'danger';
      }

      return 'default';
    }
  }),
});
