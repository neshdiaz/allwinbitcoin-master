import Ember from 'ember';
import ItemCommon from 'front/mixins/item-common';

const {
  computed,
  Component,
  get,
  isEmpty,
  isArray
} = Ember;

export default Component.extend(ItemCommon, {
  classNames: ['list-item'],
  classNameBindings: ['active:active:inactive',
                      'closeToCollect:close-to-collect'],
  active: computed('model.level.id', 'model.user.activeLevels.[]', {
    get() {
      const levelId = this.get('model.level.id');
      const activeLevels = this.get('model.user.activeLevels');

      if (isEmpty(activeLevels) || !isArray(activeLevels)) {
        return false;
      }

      const userIsActiveInLevel = activeLevels.find((l) => {

        return get(l, 'id') === levelId;
      });

      return userIsActiveInLevel ? true : false;
    }
  }),
  //closeToCollect: computed.lte('model.position', 3),
  closeToCollect: computed('model.id', {
    get() {
      return this.get('model.id') ? true : false;
    }
  })
});
