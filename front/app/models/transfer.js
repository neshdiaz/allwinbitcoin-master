import RequestModel from './request';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';

const {
  attr
} = DS;

const Validations = buildValidations({
  to: [
    validator('presence', {
      presence: true,
      ignoreBlank: true
    })
  ],
  value: [
    validator('presence', true)
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
  to: attr('string'),
  secondKey: attr('string'),
  value: attr('number')
});
