import Ember from 'ember';
import accounting from 'accounting';

const {
  Helper,
  inject: { service },
  isEmpty
} = Ember;

export default Helper.extend({
  app: service(),

  compute([value, ...rest], { format }) {
    let user = this.get('app.user');

    if (isEmpty(user)) {
      return value;
    }

    let symbol = user.get('config.currency');
    format = format || '%v %s';

    return accounting.formatMoney(value, {
      format, symbol
    });
  }
});
