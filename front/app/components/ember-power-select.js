import EmberPowerSelect from 'ember-power-select/components/power-select';
import Ember from 'ember';

const {
  inject: { service },
  computed
} = Ember;

export default EmberPowerSelect.extend({
  i18n: service(),

  searchEnabled: true,
  allowClear: true,

  loadingMessage: computed('i18n.locale', function() {
    return this.get('i18n').t('select_loading');
  }),
  noMatchesMessage: computed('i18n.locale', function() {
    return this.get('i18n').t('select_no_match');
  }),
  searchMessage: computed('i18n.locale', function() {
    return this.get('i18n').t('select_searching');
  })
});
