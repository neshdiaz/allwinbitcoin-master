function calculateLocale() {
  return navigator.language || navigator.userLanguage || 'es-CO';
}

export function initialize(appInstance) {
  appInstance.lookup('service:i18n').set('locale', calculateLocale());
}

export default {
  name: 'i18n',
  initialize
};
