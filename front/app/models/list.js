import DS from 'ember-data';
import Model from './base';
import Ember from 'ember';

const {
  attr,
  belongsTo,
  hasMany
} = DS;

const {
  computed,
  inject: { service }
} = Ember;

export default Model.extend({
  i18n: service(),

  number: attr('number'),
  level: belongsTo('level', { inverse: null }),
  blocked: attr('boolean', { defaultValue: false }),
  status: attr('string'),
  accounts: hasMany('account', { inverse: null }),
  splitDate: attr('date'),
  super: belongsTo('list', { inverse: null }),

  toStr: computed('i18n.locale', 'number', {
    get() {
      return `${this.get('i18n').t('list')} # ${this.get('number')}`;
    }
  }),
  statusCSS: computed('status', {
    get() {
      let status = this.get('status');

      if (status === 'active') {
        return 'success';
      }

      if (status === 'closed') {
        return 'danger';
      }

      if (status === 'dividing') {
        return 'warning';
      }

      return 'default';
    }
  }),
  isClosed: computed.equal('status', 'closed'),
  isInactive: computed.equal('status', 'inactive')
});
