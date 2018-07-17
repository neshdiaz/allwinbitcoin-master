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
  classNames: ['admin-retirement-table'],
  modelName: 'retirement',
  sort: 'createdAt',
  sortDir: 'desc',
  all: false,
  columns: computed('i18n.locale', function() {
    return [
      {
        label: this.get('i18n').t('title_status'),
        valuePath: 'status',
        cellComponent: 'cells/request/status-cell',
        sortable: true,
      },
      {
        label: this.get('i18n').t('title_creator'),
        valuePath: 'creator.username',
        valuePathToSort: '__creator',
        sortable: true
      },
      {
        label: this.get('i18n').t('title_date'),
        valuePath: 'createdAt',
        valuePathToSort: 'createdAt',
        sortable: true,
        format: function (v) {
          return moment(v).format(ENV.moment.outputFullFormat);
        }
      },
      {
        label: this.get('i18n').t('title_value'),
        valuePath: 'value',
        cellComponent: 'cells/retirement/value-cell',
        sortable: true
      },
      {
        label: 'Billetera',
        valuePath: 'bitcoinAddress',
        sortable: false
      },
      {
        label: this.get('i18n').t('title_observations'),
        valuePath: 'observations',
        cellComponent: 'cells/request/observations-cell',
        sortable: true
      },
      {
        width: '100px',
        sortable: false,
        cellComponent: 'cells/retirement/actions-cell',
        align: 'right'
      }
    ];
  })
});
