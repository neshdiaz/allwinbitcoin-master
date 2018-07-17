/* global jconfirm */
import Ember from 'ember';

const {
  Service,
  inject:  { service },
  merge,
  isEmpty,
  $,
  RSVP
} = Ember;

export default Service.extend({
  i18n: service(),

  init() {
    this._super(...arguments);
    this._setDefaultsConfirmPlugin();
  },

  /**
   * Set default globals options
   * @api private
   */
  _setDefaultsConfirmPlugin() {
    jconfirm.defaults = {
      typeAnimated: true,
      offsetTop: 150,
      alignMiddle: false
    };
  },

  confirm(options, pluginOptions={}) {
    let data = {};
    let buttons = {};

    pluginOptions.type = 'confirm';

    data.title = this.get('i18n').t(options.title).string;
    data.content = this.get('i18n').t(options.content).string;

    options.buttons.forEach((button) => {
      let text = this.get('i18n').t(button.text).string;

      merge(buttons, {
        [text]: {
          text,
          btnClass: button.btnClass,
          action: button.action
        }
      });
    });

    data.buttons = buttons;

    // Allow plugin options
    merge(data, pluginOptions);

    $.confirm(data);
  },

  simpleYesNoConfirm(title, content) {
    return new RSVP.Promise((resolve) => {

      this.confirm({
        title,
        content,
        buttons: [{
          text: 'action_yes',
          btnClass: 'bg-purple',
          action: () => resolve(true)
        }, {
          text: 'action_no',
          action: () => resolve(false)
        }]
      });
    });
  },

  alert(title, content) {
    $.alert({
      title: isEmpty(title) ? title : this.get('i18n').t(title).string,
      content: this.get('i18n').t(content).string
    });
  },

  simpleAlert(title, content) {
    $.alert({
      title,
      content
    });
  },

  success(title, content, pluginOptions={}) {
    pluginOptions.type = 'success';

    let options = {
      title: isEmpty(title) ? title : this.get('i18n').t(title).string,
      content: this.get('i18n').t(content).string
    };

    merge(options, pluginOptions);

    $.alert(options);
  }
});
