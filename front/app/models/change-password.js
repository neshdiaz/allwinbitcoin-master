import DS from 'ember-data';
import Model from './base';
import { validator, buildValidations } from 'ember-cp-validations';
import Ember from 'ember';

const {
  computed,
  inject: { service }
} = Ember;

const {
  attr
} = DS;

const Validations = buildValidations({
  currentPassword: [
    validator('presence', {
      presence: true,
      ignoreBlank: true
    }),
    validator('length', {
      min: 6
    })
  ],
  password: [
    validator('presence', true),
    validator('length', {
      min: 6
    })
  ],
  passwordConfirmation: validator('confirmation', {
    on: 'password',
    description: computed('i18n.locale', function () {
      return this.get('model.i18n').t('password_confirmation');
    })
  })
});

export default Model.extend(Validations, {
  i18n: service(),

  currentPassword: attr('string'),
  password: attr('string'),
  passwordConfirmation: attr('string')
});
