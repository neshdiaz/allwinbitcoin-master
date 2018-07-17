import DS from 'ember-data';
import Ember from 'ember';
import Model from './base';
import { validator, buildValidations } from 'ember-cp-validations';
import accounting from 'accounting';

const {
  attr
} = DS;

const {
  computed
} = Ember;

const Validations = buildValidations({
  minimumBalanceToCollect: [
    validator('number', {
      allowString: true,
      integer: false,
      positive: true,
      gt: 0
    })
  ],
  transferFee: [
    validator('number', {
      allowString: true,
      integer: false,
      positive: true,
      gt: 0
    })
  ],
  retirementFee: [
    validator('number', {
      allowString: true,
      integer: false,
      positive: true,
      gt: 0
    })
  ],
  orderFee: [
    validator('number', {
      allowString: true,
      integer: false,
      positive: true,
      gt: 0
    })
  ],
  currency: [
    validator('presence', true)
  ]
});

export default Model.extend(Validations, {
  minimumBalanceToCollect: attr('number'),
  transferFee: attr('number'),
  retirementFee: attr('number'),
  orderFee: attr('number'),
  currency: attr('string'),
  monday: attr('boolean', { defaultValue: false }),
  tuesday: attr('boolean', { defaultValue: false }),
  wednesday: attr('boolean', { defaultValue: false }),
  thursday: attr('boolean', { defaultValue: false }),
  friday: attr('boolean', { defaultValue: false }),
  saturday: attr('boolean', { defaultValue: false }),
  sunday: attr('boolean', { defaultValue: false }),

  transferFeeDummy: computed('transferFee', {
    get() {
      const val = accounting.formatMoney(this.get('transferFee') + 0.00001, {
        precision: 8, symbol: ''
      });
      return val;
    }
  }),

  minimumBalanceToCollectStr: computed('minimumBalanceToCollect', {
    get() {
      const val = accounting.formatMoney(this.get('minimumBalanceToCollect'), {
        precision: 8, symbol: ''
      });
      return val;
    }
  })
});
