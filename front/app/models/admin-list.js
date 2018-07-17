import ListModel from './list';
import DS from 'ember-data';
import { validator, buildValidations } from 'ember-cp-validations';
import Ember from 'ember';

const {
  attr
} = DS;

const {
  computed
} = Ember;

const Validations = buildValidations({
  user1: [
    validator('presence', {
      presence: true,
      disabled: computed.not('model.isNew')
    })
  ],
  user2: [
    validator('presence', {
      presence: true,
      disabled: computed.not('model.isNew')
    })
  ],
  user3: [
    validator('presence', {
      presence: true,
      disabled: computed.not('model.isNew')
    })
  ],
  level: [
    validator('presence', {
      presence: true,
      disabled: computed.not('model.isNew')
    })
  ]
});

export default ListModel.extend(Validations, {
  user1: attr('string'),
  user2: attr('string'),
  user3: attr('string'),
  status: attr('string'),
  fromAdmin: attr('boolean', { defaultValue: false })
});
