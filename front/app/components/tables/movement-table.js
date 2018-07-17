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
  classNames: ['movement-table'],
  modelName: 'movement',
  sort: 'createdAt',
  sortDir: 'desc',
  columns: computed('i18n.locale', function() {
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
        label: this.get('i18n').t('title_movement_type'),
        valuePath: 'movementType',
        valuePathToSort: 'movementType',
        cellComponent: 'cells/movement/type-cell',
        sortable: true,
      },
      {
        label: this.get('i18n').t('title_credit'),
        valuePath: 'credit',
        sortable: true,
        valuePathToSort: 'credit'
      },
      {
        label: this.get('i18n').t('title_debit'),
        valuePath: 'debit',
        sortable: true,
        valuePathToSort: 'debit'
      },
      {
        label: this.get('i18n').t('title_list'),
        sortable: false,
        valuePath: 'list.toStr'
      },
      {
        label: this.get('i18n').t('title_level'),
        sortable: false,
        valuePath: 'list.level.toStr'
      },
      {
        label: this.get('i18n').t('title_from'),
        valuePath: 'from',
        sortable: true
      },
      {
        label: this.get('i18n').t('title_to'),
        valuePath: 'to',
        sortable: true
      },
    ];
  })
});
