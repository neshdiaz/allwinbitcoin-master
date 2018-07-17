import Ember from 'ember';

const {
  Mixin,
  run,
} = Ember;

export default Mixin.create({
  classNames: ['box'],
  classNameBindings: ['boxSolid:box-solid','isWidget:box-widget', 'alignToBottom:fixed'],
  boxSolid: false,
  isWidget: false,
  alignToBottom: false,
  debounceTimeout: 200,

  didInsertElement() {
    this._super(...arguments);

    if (!this.get('alignToBottom')) {
      return;
    }

    this._onResize = () => this.setHeight();
    run.scheduleOnce('afterRender', this, this.setHeight);
    window.addEventListener('resize', this._onResize);
  },

  setHeight() {
    let top = this.$().offset().top;
    //let footerTop = Ember.$('.main-footer').offset().top;
    let footerHeight = Ember.$('.main-footer').outerHeight() || 0;

    this.$().css('min-height',
      // 15px for padding top of content
      Ember.$(window).height() - top - footerHeight - 30);
  },

  willDestroyElement() {
    this._super(...arguments);
    window.removeEventListener('resize', this._onResize);
  }
});
