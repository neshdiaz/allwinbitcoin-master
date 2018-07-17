import Element from 'ember-bootstrap-cp-validations/components/bs-form/element';
import Ember from 'ember';

const {
  computed,
  isEqual,
  defineProperty,
  inject: {
    service
  }
} = Ember;

export default Element.extend({
  i18n: service(),

  /** Control that only errors are displayed with the onchange event */
  showValidationOn: computed('controlType', {
    get() {
      let controlType = this.get('controlType');

      if (!isEqual(controlType, 'select')) {
        return 'input';
      }

      return 'focusOut';
    }
  }),

  /** Enable support for default ember data errors */
  setupValidations() {
    this._super(...arguments);
    defineProperty(this, '_DSerrors', computed.readOnly(`model.errors.${this.get('property')}`));
    defineProperty(this, 'DSerrors', computed.mapBy('_DSerrors', 'message'));
    defineProperty(this, 'hasDSerrors', computed.gt('DSerrors.length', 0));
    defineProperty(this, 'hasCustomError', computed.alias('hasDSerrors'));
    defineProperty(this, 'customError', computed('DSerrors', 'i18n.locale', {
      get() {
        let errors = this.get('DSerrors').map((e) => {
          return this.get('i18n').t(e);
        });

        return errors;
      }
    }));
  }
});
