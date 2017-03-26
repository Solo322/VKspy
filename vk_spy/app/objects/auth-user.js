import Ember from 'ember';

export default Ember.Object.extend({
   	firstName: null,
	lastName: null,
	id: null,
	token: null,

	fullName: Ember.computed('firstName', 'lastName', function() {
		return `${this.get('firstName')} ${this.get('lastName')}`;
	})
});