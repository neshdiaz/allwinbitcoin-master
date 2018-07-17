import ModelTable from './model-table';
import Ember from 'ember';
import moment from 'moment';
import ENV from 'front/config/environment';

const {
  inject: { service },
  computed
} = Ember;

export default ModelTable.extend({
  i18n: service(),
  classNames: ['admin-list-table'],
  modelName: 'admin-list',
  sort: 'createdAt',
  sortDir: 'desc',
  all: false,
  columns: computed('i18n.locale', function() {
    return [
      {
        label: this.get('i18n').t('title_created'),
        valuePath: 'createdAt',
        valuePathToSort: 'createdAt',
        sortable: true,
        format(v) {
          return moment(v).format(ENV.moment.outputFullFormat);
        }
      },
      {
        label: this.get('i18n').t('title_status'),
        valuePath: 'status',
        cellComponent: 'cells/list/status-cell',
        sortable: true,
        width: '80px'
      },
      {
        label: this.get('i18n').t('title_splitDate'),
        valuePath: 'splitDate',
        valuePathToSort: 'splitDate',
        format(v) {
          if (v) {
            return moment(v).format(ENV.moment.outputFullFormat);
          }
        }
      },
      {
        label: this.get('i18n').t('title_super'),
        valuePath: 'super.number',
        sortable: false
      },
      {
        label: this.get('i18n').t('title_number'),
        valuePath: 'number',
        sortable: true,
        valuePathToSort: 'number'
      },
      {
        label: this.get('i18n').t('title_level'),
        valuePath: 'level.toStr',
        sortable: true,
        valuePathToSort: '__level'
      },
      {
        label: this.get('i18n').t('title_blocked'),
        valuePath: 'blocked',
        cellComponent: 'cells/list/blocked-cell',
        sortable: true,
        valuePathToSort: 'blocked',
        width: '80px',
        cellType: 'list-status',
        align: 'center'
      },
      {
        width: '150px',
        sortable: false,
        cellComponent: 'cells/list/actions-cell',
        align: 'right'
      }
    ];
  })
});
