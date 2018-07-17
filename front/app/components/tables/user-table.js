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
  classNames: ['user-table'],
  modelName: 'user',
  sort: 'createdAt',
  sortDir: 'desc',
  canExpand: true,
  expandedRowComponent: 'rows/user-row',
  columns: computed('i18n.locale', function () {
    return [
      {
        label: this.get('i18n').t('title_created'),
        valuePath: 'createdAt',
        sortable: true,
        valuePathToSort: 'createdAt',
        format(v) {
          return moment(v).format(ENV.moment.outputFullFormat);
        }
      },
      {
        label: this.get('i18n').t('title_status'),
        valuePath: 'status',
        cellComponent: 'cells/user/status-cell',
        sortable: true
      },
      {
        label: this.get('i18n').t('title_username'),
        valuePath: 'username',
        sortable: true
      },
      {
        label: this.get('i18n').t('title_name'),
        valuePath: 'name',
        sortable: true
      },
      {
        label: this.get('i18n').t('title_email'),
        valuePath: 'email',
        sortable: true
      },
      {
        width: '130px',
        sortable: false,
        cellComponent: 'cells/user/actions-cell',
        align: 'right'
      }
    ];
  })
});
