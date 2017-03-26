import Ember from 'ember';
import AuthUser from './../objects/auth-user';

export default Ember.Service.extend({
    users: null,
    currentUser: null,
    usersChanged: function() {
        // При каких либо изменения в users запишем это в файл
        // TODO сделать запись один раз при выходе из программы!
        var fs = require('fs');
        fs.writeFile('cookie.json', JSON.stringify(this.get('users'), null, 2) , 'utf-8');   
    }.observes('users.[]'),

    init(){
        this._super(...arguments);
        this.set('users', []);
        var fs = require('fs');
        if (fs.existsSync('cookie.json')) {
            let contents = fs.readFileSync('cookie.json', 'utf-8');
            if( contents.length ){
                let saved_users = JSON.parse(contents);
                let auth_users = [];
                for(let i = 0; i < saved_users.length; i++){
                    let user = AuthUser.create(saved_users[i]);
                    auth_users.push( user );
                }
                this.set('users', auth_users);
            }
        }
    },

    add(item) {
        console.log('Inside Add Service');
        console.log(item);
        this.set('currentUser', item);
        this.get('users').pushObject(item);
    }, 

    remove(item) {
        this.get('users').removeObject(item);
        // TODO проверить
        if( this.get('currentUser') === item ){
            this.set('currentUser', null);
        }
    },

    // removeByID( id ){
    //     let users = this.get('users');
    //     for (var j = 0; j < users.length; j++){
    //         if( users[j].id === id ){
    //             users.splice(j, 1)
    //             return;
    //         }
    //     }        
    // },

    // userToken( id ){
    //     let users = this.get('users');
    //     for (var j = 0; j < users.length; j++){
    //         if( users[j].id === id )
    //             return users[j].token;
    //     }
    // },

    getCurrentUser(){
        if(this.get('currentUser') === null){
            let users = this.get('users');
            if(users.length >= 1){
                this.set('currentUser', users[0]);
            }
        }

        console.log( 'Current user is' );
        console.log( this.get('currentUser') );
        return this.get('currentUser');
    },

    empty() {
        this.get('users').setObjects([]);
    }
});
