import Ember from 'ember';
import ENV from 'front/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import Nes from 'npm:nes';

const {
  Service,
  inject: { service },
  run: { bind }
} = Ember;

export default Service.extend(DataAdapterMixin, {
  host: ENV.host,
  authorizer: ENV.authorizer,
  logger: service(),
  event: service(),
  store: service(),

  init() {
    let host = this.get('host');

    // Parse host
    host = host.replace('http', 'ws');
    host = host.replace('https', 'ws');

    let client = new Nes.Client(host);

    this.set('client', client);
    this.set('isConnected', false);
  },

  connect() {
    let auth = { headers: this.headersForRequest() };
    this.get('client').connect({ auth }, bind(this, this._connect));
  },

  _connect(err) {
    if (err) {
      this.get('logger').debug(err);
      return;
    }

    this.set('isConnected', true);
    this.setSubscriptions();
  },

  disconnect() {
    this.get('client').disconnect(bind(this, this._disconnect));
  },

  _disconnect(err) {
    if (err) {
      this.get('logger').debug(err);
      return;
    }

    this.set('isConnected', false);
  },

  setSubscriptions() {
    let client = this.get('client');
    let event = this.get('event');
    let models = [
      {
        type: 'event',
        events: ['created']
      },
      {
        type: 'account',
        events: ['created']
      },
      {
        type: 'list',
        events: ['created', 'updated']
      },
      {
        type: 'join',
        events: ['created', 'updated']
      },
      {
        type: 'order',
        events: ['created', 'updated']
      },
      {
        type: 'transfer',
        events: ['created', 'updated']
      },
      {
        type: 'retirement',
        events: ['created', 'updated']
      }
    ];

    // Set Subscriptions

    models.forEach((model) => {
      model.events.forEach((_event) => {
        client.subscribe(`/${model.type}/${_event}`, (data) => {
          event.notify(model.type, _event, this.transform(model.type, data));
        }, bind(this, this._handleError));
      });
    });
  },

  transform(type, attributes) {
    let store = this.get('store');
    let id = attributes._id;

    store.pushPayload({
      [type]: [attributes]
    });

    return store.peekRecord(type, id);
  },

  _handleError(err) {
    if (err) {
      this.get('logger').debug(err);
      return;
    }
  }
});
