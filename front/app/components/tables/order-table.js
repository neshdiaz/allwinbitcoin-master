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
  classNames: ['order-table'],
  modelName: 'order',
  sort: 'createdAt',
  sortDir: 'desc',
  expandedRowComponent: 'rows/order-row',
  columns: computed('i18n.locale', function () {
    return [
      {
        label: this.get('i18n').t('title_date'),
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
        cellComponent: 'cells/order/status-cell',
        sortable: true,
      },
      /*
      {
        label: this.get('i18n').t('title_value_in_btc'),
        valuePath: 'value',
        sortable: true,
        valuePathToSort: 'value',
        format(v) {
          return `$ ${v} USD`;
        }
      },
      */
      {
        label: this.get('i18n').t('title_value_in_btc'),
        valuePath: 'amount_in_btc',
        sortable: true,
        format(v) {
          return `${v} BTC`;
        }
      },
      {
        label: this.get('i18n').t('title_pay'),
        valuePath: 'payment_id',
        cellComponent: 'cells/order/payment-cell',
        sortable: false
      }
    ];
  }),

   /** Override */
  modelCreated(model) {
    this._super(...arguments);

    let row = this.findRow(model);

    if (row) {
      row.set('expanded', true);
    }
  },

  /** Override */
  modelUpdated(model) {
    this._super(model);

    // Reload info for user in session
    this.get('loadUserInfo').perform();

    let row = this.findRow(model);

    if (row && row.get('expanded')) {
      row.set('expanded', false);
    }
  },

  loadUserInfo: task(function * () {
    yield this.get('app').load();
  }).drop()
});
