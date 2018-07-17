// app/initializers/accounting.js
import { currency } from 'accounting/settings';

export default {
  name: 'accounting.js',
  initialize: function() {
    currency.precision = 4;
  }
};
