import Model from './base';
import DS from 'ember-data';
import Ember from 'ember';
import accounting from 'accounting';

const {
  belongsTo,
  attr
} = DS;

const {
  computed,
  isEmpty,
  String: { htmlSafe },
  inject: { service },
  get
} = Ember;

export default Model.extend({
  app: service(),

  user: belongsTo('user', { inverse: null }),
  eventType: attr('string'),
  value: attr('number'),
  list: belongsTo('list', { inverse: null }),
  username: attr('string'),

  valueToStr: computed('value', 'app.user', 'app.user.config.currency', {
    get() {
      let user = this.get('app.user');
      let value = this.get('value');

      if (isEmpty(user)) {
        return '';
      }

      let symbol = get(user, 'config.currency');
      let format = '%v %s';
      let precision = 8;

      value = accounting.formatMoney(value, {
        format, symbol, precision
      });

      return htmlSafe(`${value}`);
    }
  }),
});
