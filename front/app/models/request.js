import DS from 'ember-data';
import Model from './base';
import Ember from 'ember';

const {
  attr
} = DS;

const {
  computed
} = Ember;

export default Model.extend({
  status: attr('string', { defaultValue: 'pending' }),
  causeOfRejection: attr('string'),
  progress: attr('number'),
  observations: attr('string'),

  statusCSS: computed('status', {
    get() {
      let status = this.get('status');

      if (status === 'completed') {
        return 'success';
      }

      if (status === 'rejected' || status === 'error') {
        return 'danger';
      }

      return 'default';
    }
  }),
  isPending: computed.equal('status', 'pending'),
  isRejected: computed.equal('status', 'rejected')
});
