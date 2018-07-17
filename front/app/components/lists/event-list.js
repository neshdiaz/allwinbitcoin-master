import ModelList from './model-list';

export default ModelList.extend({
  modelName: 'event',
  classNames: ['event-list'],
  canSubscribeSearch: false,
  limit: 10,
  sort: 'createdAt',
  sortDir: 'desc',
  all: false,

  modelCreated(item) {
    let length = this.get('model.length');
    let limit = this.get('limit');
    let model = this.get('model');

    model.insertAt(0, item);

    if (length >= limit) {
      model.popObject();
    }
  }
});
