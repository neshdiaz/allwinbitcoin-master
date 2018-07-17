import Ember from 'ember';
import TableCommon from 'front/mixins/table-common';
import PaginationCommon from 'front/mixins/pagination-common';
import layout from 'front/templates/components/tables/model-table';
import Table from 'ember-light-table';
import { task } from 'ember-concurrency';

const {
  Component,
  inject: { service },
  set
} = Ember;

export default Component.extend(PaginationCommon, TableCommon, {
  event: service(),
  notification: service(),
  classNames: ['model-table'],
  layout,
  enableSync: true,
  canSubscribeEvents: true,
  canSubscribeSearch: true,
  multiRowExpansion: false,
  canExpand: false,

  init() {
    this._super(...arguments);

    let table = new Table(this.get('columns'), this.get('model'), {
      enableSync: this.get('enableSync')
    });
    let sortColumn = table.get('allColumns').findBy('valuePathToSort', this.get('sort'));

    // Setup initial sort column
    if (sortColumn) {
      let sortDir = this.get('sortDir');

      sortColumn.set('sorted', true);
      sortColumn.set('ascending', sortDir === 'asc' || !sortDir ? true : false);
    }

    this.set('table', table);

    if (this.get('canSubscribeEvents')) {
      this.subscribeEvents();
    }

    if (this.get('canSubscribeSearch')) {
      this.subscribeSearch();
    }

    this.setupTableActions();
  },

  setupTableActions() {
    let tableActions = {
      delete: this.get('deleteRecord')
    };

    this.set('tableActions', tableActions);
    return tableActions;
  },

  willDestroyElement() {
    this._super(...arguments);
    this.unsubscribeEvents();
    this.unsubscribeSearch();
  },

  subscribeSearch() {
    this.get('event').on(`${this.get('modelName')}-form-search`,
      this,
      this.execSearch);
  },

  subscribeEvents() {
    this.get('event').on(`${this.get('modelName')}-created`,
      this,
      this.modelCreated);
    this.get('event').on(`${this.get('modelName')}-updated`,
      this,
      this.modelUpdated);
    this.get('event').on(`${this.get('modelName')}-filter`,
      this,
      this.changeFilter);
  },

  unsubscribeSearch() {
    this.get('event').off(`${this.get('modelName')}-form-search`,
      this,
      this.execSearch);
  },

  unsubscribeEvents() {
    this.get('event').off(`${this.get('modelName')}-created`,
      this,
      this.modelCreated);
    this.get('event').off(`${this.get('modelName')}-updated`,
      this,
      this.modelUpdated);
    this.get('event').off(`${this.get('modelName')}-filter`,
      this,
      this.changeFilter);
  },

  changeFilter(property, value) {
    set(this.get('filters'), property, value);
    this.set('page', 1);
    this.reset();
  },

  reset() {
    this.get('model').clear();
    this.get('refresh').perform();
  },

  findRow(model) {
    let rows = this.get('table.rows');
    let row = rows.find((r) => {
      let id = r.get('content.id');
      return id === model.get('id');
    });

    return row;
  },

  modelUpdated(item) {
    let row = this.findRow(item);

    if (!row) {
      this.get('fetchRecords').perform();
      return;
    }

    row.set('content', item);
  },

  modelCreated(model) {
    this.get('model').insertAt(0, model);
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.get('fetchRecords').perform();
  },

  actions: {
    onScrolledToBottom() {
      this.get('loadMore').perform();
    },

    onColumnClick(column) {
      if (column.sorted) {
        this.setProperties({
          sortDir: column.ascending ? 'asc' : 'desc',
          sort: column.get('valuePathToSort') ||
                `__${column.get('valuePath')}`,
          page: 1
        });
        this.get('model').clear();
        this.get('fetchRecords').perform();
      }
    },

    onFormSuccess() {
    },

    actions: {
      removeRow(row) {
        this.get('deleteRecord').perform(row);
      }
    }
  },

  deleteRecord: task(function * (row) {
    let confirm = yield this.get('notification').simpleYesNoConfirm(
      'title_confirm_delete',
      'msg_confirm_delete');

    if (!confirm) {
      return;
    }

    try {
      yield row.get('content').destroyRecord();
      this.get('table').removeRow(row);
    }
    catch (e) {
      this.get('app').handleError(e);
    }
  }).drop()
});
