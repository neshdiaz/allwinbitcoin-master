import Ember from 'ember';
import BoxCommon from 'front/mixins/box-common';

const {
  Component,
  inject: { service }
} = Ember;

export default Component.extend(BoxCommon, {
  store: service(),
  event: service(),
  notification: service(),

  classNames: ['retirement-box'],
  alignToBottom: true,
  openModal: false,

  actions: {
    onFormSuccess(record) {
      this.get('event').notify('retirement', 'created', record);
    },
    createRetirement() {
      if (!this.get('app.isValidDayForRetirement')) {
        const days = [];

        if (this.get('app.user.config.monday')) {
          days.push('Lunes');
        }

        if (this.get('app.user.config.tuesday')) {
          days.push('Martes');
        }

        if (this.get('app.user.config.wednesday')) {
          days.push('Miercoles');
        }

        if (this.get('app.user.config.thursday')) {
          days.push('Jueves');
        }

        if (this.get('app.user.config.friday')) {
          days.push('Viernes');
        }

        if (this.get('app.user.config.saturday')) {
          days.push('Sabado');
        }

        if (this.get('app.user.config.sunday')) {
          days.push('Domingo');
        }

        this.get('notification').simpleAlert(
          'Día no valido',
          'Lo sentimos, hoy no es un día valido para solicitar retiro.<br>' +
          'Los días validos son:<br>' +
          days.join(' - ')
        );

        return;
      }

      let model = this.get('store').createRecord('retirement');
      this.set('model', model);
      this.set('openModal', true);
    }
  }
});
