/* global NProgress*/
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import ENV from 'front/config/environment';

const {
  RESTAdapter
} = DS;

export default RESTAdapter.extend(DataAdapterMixin, {
  authorizer: ENV.authorizer,
  host: ENV.host,
  namespace: ENV.namespace,

  pathForType(modelName) {
    return modelName;
  },

  ajax() {
    NProgress.start();
    return this._super(...arguments);
  },

  handleResponse() {
    NProgress.done();
    return this._super(...arguments);
  }
});
