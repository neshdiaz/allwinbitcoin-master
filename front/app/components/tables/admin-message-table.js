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
  classNames: ['admin-message-table'],
  modelName: 'admin-message',
  sort: 'createdAt',
  sortDir: 'desc',
  all: true,
  columns: computed('i18n.locale', function () {
    return [
      {
        label: this.get('i18n').t('title_created'),
        valuePath: 'createdAt',
        valuePathToSort: 'createdAt',
        sortable: true,
        format(v) {
          return moment(v).format(ENV.moment.outputFullFormat);
        },
        width: '140px'
      },
      {
        label: this.get('i18n').t('title_status'),
        valuePath: 'status',
        cellComponent: 'cells/message/status-cell',
        sortable: true,
        width: '80px'
      },
      {
        label: this.get('i18n').t('title_message'),
        sortable: true,
        valuePath: 'message'
      },
      {
        label: this.get('i18n').t('title_style'),
        valuePath: 'style',
        cellComponent: 'cells/message/style-cell',
        sortable: true,
        width: '110px'
      },
      {
        width: '150px',
        sortable: false,
        cellComponent: 'cells/message/actions-cell',
        align: 'right'
      }
    ];
  })
});
