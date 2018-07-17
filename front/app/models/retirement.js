import RequestModel from './request';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import Ember from 'ember';
import accounting from 'accounting';

const {
  computed
} = Ember;

const {
  attr,
  belongsTo
} = DS;

const Validations = buildValidations({
  value: [
    validator('number', {
      allowString: true,
      integer: false,
      positive: true,
      gt: 0
    })
  ],
  observations: [
    validator('presence', {
      presence: true,
      disabled: computed.equal('model.isNew', true)
    })
  ],
  secondKey: [
    validator('presence', {
      presence: true
    }),
    validator('length', {
      min: 4
    })
  ]
});

export default RequestModel.extend(Validations, {
  value: attr('number'),
  creator: belongsTo('user', { inverse: null }),
  btcAddress: attr('string'),
  secondKey: attr('string'),
  bitcoinAddress: computed('btcAddress', 'value', 'networth', {
    get() {
      let address = this.get('btcAddress');
      let amountInBtc = this.get('networth');
      let precision = 8;

      amountInBtc = accounting.formatMoney(amountInBtc, {
        precision, symbol: ''
      });

      return `bitcoin:${address}?amount=${amountInBtc}`;
    }
  }),
  networth: computed('app.user.config.retirementFee', 'value', {
    get() {
      let fee = this.get('app.user.config.retirementFee');
      let value = this.get('value');

      return value - (value * fee / 100);
    }
  })
});
