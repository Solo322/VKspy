import Ember from 'ember';

export default Ember.Service.extend({
    users: null,

    init() {
        this._super(...arguments);
        this.set('users', []);
    },

    add(item) {
        this.get('users').pushObject(item);
    }, 

    remove(item) {
        this.get('users').removeObject(item);
    },

    userToken( id ){
        var users = this.get('users');
        console.log( 'Inside userToken. Users:' ); 
        console.log( users );
        for (var j = 0; j < users.length; j++){
            if( users[j].id === id )
                return users[j].token;
        }
    },

    empty() {
        this.get('users').setObjects([]);
    }
});
