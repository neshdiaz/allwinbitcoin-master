import DS from 'ember-data';
import Model from './base';
import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const {
  attr,
  belongsTo,
  hasMany
} = DS;

const {
  computed,
  inject: { service }
} = Ember;

const Validations = buildValidations({
  email: [
    validator('presence', {
      presence: true,
      ignoreBlank: true
    }),
    validator('format', { type: 'email' })
  ],
  username: [
    validator('presence', true),
    validator('length', {
      min: 4,
      max: 14
    })
  ],
  name: [
    validator('presence', true)
  ],
  country: validator('presence', {
    presence: true
  }),
  password: [
    validator('presence', {
      presence: true,
      disabled: computed.not('model.isNew')
    }),
    validator('length', {
      min: 6,
      disabled: computed.not('model.isNew')
    })
  ],
  passwordConfirmation: validator('confirmation', {
    on: 'password',
    description: computed('i18n.locale', function () {
      return this.get('model.i18n').t('password_confirmation');
    }),
    disabled: computed.not('model.isNew')
  })
});

export default Model.extend(Validations, {
  i18n: service(),

  username: attr('string'),
  email: attr('string'),
  avatar: attr('string'),
  name: attr('string'),
  password: attr('string'),
  passwordConfirmation: attr('string'),
  isAdmin: attr('boolean', { defaultValue: false }),
  sponsor: belongsTo('user', { inverse: null }),
  referreds: attr('number'),
  activeReferreds: attr('number'),
  phone: attr('string'),
  country: attr(),
  city: attr('string'),
  language: attr('string'),
  status: attr('string'),
  wallet: belongsTo('wallet', { inverse: null }),
  config: belongsTo('config', { inverse: null }),
  levels: hasMany('level', { inverse: null }),
  btcAddress: attr('string'),
  activeLevels: hasMany('level', { inverse: null }),
  referredList: hasMany('user', { inverse: null }),
  activeReferredsList: hasMany('user', { inverse: null }),

  active: computed.equal('status', 'active'),
  toStr: computed.alias('username'),

  statusCSS: computed('status', {
    get() {
      let status = this.get('status');

      if (status === 'active') {
        return 'success';
      }

      if (status === 'locked') {
        return 'warning';
      }

      return 'default';
    }
  }),
});
