import Ember from 'ember';
import VKUser from './../objects/vk-user';

export default Ember.Service.extend({

    users: null,
    currentUser: null,
    usersChanged: function() {
        // При каких либо изменения в users запишем это в файл
        // TODO сделать запись один раз при выходе из программы!
        var fs = require('fs');
        fs.writeFile('cookie.json', JSON.stringify(this.get('users'), null, 2) , 'utf-8', function(){} );   
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
                    let user = VKUser.create(saved_users[i]);
                    auth_users.push( user );
                }
                this.set('users', auth_users);
                if( auth_users.length > 0 )
                    this.set('currentUser', auth_users[0]);
            }
        }
    },

    add(item) {
        let finded_user = this.get('users').findBy( 'id', item.id );
        if( finded_user ){
            this.get('users').removeObject(finded_user);
        }
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
