import ModelForm from './model-form';
import languages from 'front/fixtures/languages';
import countries from 'front/fixtures/countries';
import userStatus from 'front/fixtures/user-status';
import Ember from 'ember';

const {
  isEmpty,
  isEqual
} = Ember;

export default ModelForm.extend({
  languages,
  countries,
  userStatus,

  actions: {
    setLanguage(lang) {
      this.set('model.language', lang.code);
      this.set('language', lang);
    }
  },

  init() {
    this._super(...arguments);

    let lang = this.get('model.language');
    let language = isEmpty(lang) ? null : languages.find((l) => {
      return isEqual(l.code, lang);
    });

    this.set('language', language);
  }
});
