import Cell from 'ember-light-table/components/cells/base';

export default Cell.extend({
  classNameBindings: ['row.blocked:bg-yellow']
});
