import Model from './base';
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
  message: [
    validator('presence', {
      presence: true
    })
  ],
  status: [
    validator('presence', {
      presence: true
    })
  ],
  style: [
    validator('presence', {
      presence: true
    })
  ]
});

export default Model.extend(Validations, {
  message: attr('string'),
  status: attr('string'),
  style: attr('string', { defaultValue: 'success' }),

  statusCSS: computed('status', {
    get() {
      const status = this.get('status');

      if (status === 'm_active') {
        return 'success';
      }

      return 'default';
    }
  }),

  messageNormalized: computed('message', {
    get() {
      return this.get('message').trim();
    }
  })
});
