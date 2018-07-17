import ModelTable from './model-table';
import Ember from 'ember';
import moment from 'moment';
import ENV from 'front/config/environment';
import { task } from 'ember-concurrency';

const {
  inject: { service },
  computed
} = Ember;

export default ModelTable.extend({
  i18n: service(),
  classNames: ['transfer-table'],
  modelName: 'transfer',
  sort: 'createdAt',
  sortDir: 'desc',
  columns: computed('i18n.locale', function() {
    return [
      {
        label: this.get('i18n').t('title_status'),
        valuePath: 'status',
        cellComponent: 'cells/request/status-cell',
        sortable: true,
      },
      {
        label: this.get('i18n').t('title_progress'),
        valuePath: 'progress',
        sortable: true,
        valuePathToSort: 'progress',
        format: function (v) {
          return `${v} %`;
        }
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
        label: this.get('i18n').t('title_to'),
        valuePath: 'to',
        sortable: true
      },
      {
        label: this.get('i18n').t('title_value'),
        valuePath: 'value',
        cellComponent: 'cells/transfer/value-cell',
        sortable: true
      },
      {
        label: this.get('i18n').t('title_observations'),
        valuePath: 'observations',
        cellComponent: 'cells/request/observations-cell',
        sortable: true
      }
    ];
  }),

  /** Override */
  modelUpdated() {
    this._super(...arguments);

    // Reload info for user in session
    this.get('loadUserInfo').perform();
  },

  loadUserInfo: task(function * () {
    yield this.get('app').load();
  }).drop()
});
