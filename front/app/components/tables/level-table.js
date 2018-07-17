import ModelTable from './model-table';
import Ember from 'ember';

const {
  inject: { service },
  computed
} = Ember;

export default ModelTable.extend({
  i18n: service(),
  classNames: ['level-table'],
  modelName: 'level',
  sort: 'value',
  sortDir: 'asc',
  columns: computed('i18n.locale', function() {
    return [
      {
        label: this.get('i18n').t('title_identifier'),
        valuePath: 'identifier',
        sortable: true
      },
      {
        label: this.get('i18n').t('title_abbr'),
        valuePath: 'abbr',
        sortable: true
      },
      {
        label: this.get('i18n').t('title_value'),
        valuePath: 'valueToStr',
        sortable: true,
        valuePathToSort: 'value'
      },
      {
        label: this.get('i18n').t('title_comission'),
        valuePath: 'commission',
        sortable: true,
        valuePathToSort: 'commission',
        format(v) {
          return `${v} %`;
        }
      },
      {
        label: this.get('i18n').t('title_quick_start_bonus'),
        valuePath: 'quickStartBonusToStr',
        sortable: true,
        valuePathToSort: 'quickStartBonus',
      },
      {
        width: '100px',
        sortable: false,
        cellComponent: 'cells/level/actions-cell',
        align: 'right'
      }
    ];
  })
});
