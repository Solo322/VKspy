import Ember from 'ember';

export default Ember.Object.extend({
	/**
	 * Имя
	 * @type {String}
	 */
   	firstName: null,
   	/**
   	 * Фамилия
   	 * @type {String}
   	 */
	lastName: null,
	/**
	 * Идентификатор
	 * @type {String}
	 */
	id: null,
	/**
	 * Аватарка 50х50
	 * @type {String}
	 */
	photo_50: null,
	/**
	 * Токен авторизации
	 * @type {String}
	 */
	token: null,

	/**
	 * @return {String} Имя + фамилия
	 */
	fullName: Ember.computed('firstName', 'lastName', function() {
		return `${this.get('firstName')} ${this.get('lastName')}`;
	})
});