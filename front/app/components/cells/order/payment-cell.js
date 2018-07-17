import Ember from 'ember';

const {
  Component
} = Ember;

export default Component.extend({
  actions: {
    toggleExpanded() {
      let row = this.get('row');
      let expanded = row.get('expanded');

      row.set('expanded', !expanded);
    }
  }
});
