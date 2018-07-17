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
  token: [
    validator('presence', {
      presence: true,
      ignoreBlank: true
    }),
    validator('length', {
      min: 6
    })
  ],
  key: [
    validator('presence', true),
    validator('length', {
      min: 4
    })
  ],
  keyConfirmation: validator('confirmation', {
    on: 'key',
    description: computed('i18n.locale', function () {
      return this.get('model.i18n').t('second_key_confirmation');
    })
  })
});

export default Model.extend(Validations, {
  i18n: service(),

  token: attr('string'),
  key: attr('string'),
  keyConfirmation: attr('string')
});
