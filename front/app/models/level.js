import DS from 'ember-data';
import Model from './base';
import Ember from 'ember';
import accounting from 'accounting';
import { validator, buildValidations } from 'ember-cp-validations';

const {
  attr
} = DS;

const {
  computed,
  isEmpty,
  String: { htmlSafe },
  inject: { service }
} = Ember;

const Validations = buildValidations({
  identifier: [
    validator('presence', {
      presence: true,
      ignoreBlank: true
    })
  ],
  value: [
    validator('presence', true),
  ],
  commission: [
    validator('presence', true)
  ],
  quickStartBonus: [
    validator('presence', true)
  ],
  abbr: [
    validator('presence', true)
  ]
});


export default Model.extend(Validations, {
  app: service(),

  identifier: attr('string'),
  value: attr('number'),
  commission: attr('number'),
  quickStartBonus: attr('number'),
  abbr: attr('string'),

  toStr: computed('identifier', 'value', 'app.user', 'app.user.config.currency', {
    get() {
      let user = this.get('app.user');
      let value = this.get('value');

      if (isEmpty(user)) {
        return '';
      }

      let symbol = user.get('config.currency');
      let format = '%v %s';

      value = accounting.formatMoney(value, {
        format, symbol
      });

      return htmlSafe(`${this.get('identifier')} &mdash; ${value}`);
    }
  }),

  valueToStr: computed('value', 'app.user', 'app.user.config.currency', {
    get() {
      let user = this.get('app.user');
      let value = this.get('value');

      if (isEmpty(user)) {
        return '';
      }

      let symbol = user.get('config.currency');
      let format = '%v %s';

      value = accounting.formatMoney(value, {
        format, symbol
      });

      return htmlSafe(`${value}`);
    }
  }),

  quickStartBonusToStr: computed('quickStartBonus', 'app.user', 'app.user.config.currency', {
    get() {
      let user = this.get('app.user');
      let value = this.get('quickStartBonus');

      if (isEmpty(user)) {
        return '';
      }

      let symbol = user.get('config.currency');
      let format = '%v %s';

      value = accounting.formatMoney(value, {
        format, symbol
      });

      return htmlSafe(`${value}`);
    }
  }),

  /** Bussiness logic */
  enableForLoggerUser: computed(
    'app.user.levels',
    'app.user.wallet.balance',
    'value', {

    get() {
      let levels = this.get('app.user.levels');
      let isInThisLevel = levels && levels.findBy('id', this.get('id'));

      if (!isInThisLevel) {
        return true;
      }

      let balance = this.get('app.user.wallet.balance');

      return (balance >= this.get('value'));
    }
  })
});
