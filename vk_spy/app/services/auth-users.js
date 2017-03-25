import Ember from 'ember';

export default Ember.Service.extend({
    users: null,
    currentUser: null,

    init(){
        this._super(...arguments);
        this.set('users', []);
        var fs = require('fs');
        if (fs.existsSync('cookie.json')) {
            let contents = fs.readFileSync('cookie.json', 'utf-8');
            if( contents.length ){
                let saved_users = JSON.parse(contents);
                this.set('users', saved_users);
            }
        }
    },

    add(item) {
        console.log('Inside Add Service');
        console.log(item);
        this.set('currentUser', item);
        this.get('users').pushObject(item);
        var fs = require('fs');
        fs.writeFile('cookie.json', JSON.stringify(this.get('users'), null, 2) , 'utf-8');
    }, 

    remove(item) {
        // TODO почистить если удаляем текущего пользователя
        this.get('users').removeObject(item);
    },

    removeByID( id ){
        let users = this.get('users');
        for (var j = 0; j < users.length; j++){
            if( users[j].id === id ){
                users.splice(j, 1)
                return;
            }
        }        
    },

    userToken( id ){
        let users = this.get('users');
        console.log( 'Inside userToken. Users:' ); 
        console.log( users );
        for (var j = 0; j < users.length; j++){
            if( users[j].id === id )
                return users[j].token;
        }
    },

    getCurrentUser(){
        if(this.get('currentUser') === null){
            let users = this.get('users');
            if(users.length >= 1){
                this.set('currentUser', users[0]);
            }
        }
        return this.get('currentUser');
    },

    empty() {
        this.get('users').setObjects([]);
    }
});
