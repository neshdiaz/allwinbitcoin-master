import Ember from 'ember';

const {
  Service,
} = Ember;

export default Service.extend({
  loaded: false,

  load() {
    if (this.get('loaded')) {
      return;
    }

    this.set('loaded', true);

    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement({
        pageLanguage: 'es',
        autoDisplay: false
      }, 'google_translate_element2');
    };

    Ember.$
    .getScript('https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
  }
});
