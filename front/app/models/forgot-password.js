import DS from 'ember-data';
import Model from './base';
import { validator, buildValidations } from 'ember-cp-validations';

const {
  attr
} = DS;

const Validations = buildValidations({
  identifier: [
    validator('presence', {
      presence: true,
      ignoreBlank: true
    })
  ]
});

export default Model.extend(Validations, {
  identifier: attr('string')
});
