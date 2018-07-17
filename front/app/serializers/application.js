import DS from 'ember-data';

const {
  RESTSerializer,
  EmbeddedRecordsMixin
} = DS;

export default RESTSerializer.extend(EmbeddedRecordsMixin, {
  primaryKey: '_id',

  payloadKeyFromModelName() {
    return 'data';
  }
});
