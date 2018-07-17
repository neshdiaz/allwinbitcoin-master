import ModelTable from './model-table';
import Ember from 'ember';

const {
  inject: { service },
  computed
} = Ember;

export default ModelTable.extend({
  i18n: service(),
  classNames: ['list-table'],
  modelName: 'list',
  sort: 'createdAt',
  sortDir: 'desc',
  all: false,
  referred: null,
  filters: computed('referred', {
    get() {
      return {
        referred: this.get('referred')
      };
    }
  }),
  columns: computed('i18n.locale', 'app.user.isAdmin', function() {
    let columns = [
      {
        label: this.get('i18n').t('title_number'),
        valuePath: 'number',
        sortable: true,
        valuePathToSort: 'number'
      }
    ];

    if (this.get('app.user.isAdmin')) {
      columns.push(
        {
          label: this.get('i18n').t('title_status'),
          valuePath: 'status',
          cellComponent: 'cells/list/status-cell',
          sortable: true,
          width: '80px'
        }
      );
    }

    columns = columns.concat([
      {
        label: this.get('i18n').t('title_level'),
        valuePath: 'level.toStr',
        sortable: true,
        valuePathToSort: '__level'
      },
      {
        width: '150px',
        sortable: false,
        cellComponent: 'cells/list/basic-actions-cell',
        align: 'right'
      }
    ]);

    return columns;
  }),

  didReceiveAttrs() {
    this.get('model').clear();
    this._super(...arguments);
  }
});
