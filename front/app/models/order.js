import DS from 'ember-data';
import Model from './base';
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const {
  attr
} = DS;

const {
  computed,
  inject: { service }
} = Ember;

const Validations = buildValidations({
  value: [
    validator('presence', true)
  ]
});

export default Model.extend(Validations, {
  i18n: service(),

  value: attr('number'),
  status: attr('string'),
  address: attr('string'),
  date: attr('date'),
  payment_id: attr('string'),
  amount_in_btc: attr('string'),
  amount_to_pay_in_btc: attr('string'),
  keychain_id: attr('string'),

  statusCSS: computed('status', {
    get() {
      let status = this.get('status');

      if (status === 'paid') {
        return 'success';
      }

      if (status === 'unconfirmed') {
        return 'warning';
      }

      if (status === 'pending') {
        return 'default';
      }

      return 'danger';
    }
  }),
  isPending: computed.equal('status', 'pending'),
  bitcoinAddress: computed('address', 'amount_in_btc', {
    get() {
      let address = this.get('address');
      let amountInBtc = this.get('amount_in_btc');

      return `bitcoin:${address}?amount=${amountInBtc}`;
    }
  })
});
