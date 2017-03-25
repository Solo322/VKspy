/* global require */
import VKSpy from './../vk_api/vk';
import Ember from 'ember';


const {remote} = require('electron');
const {BrowserWindow, ipcMain} = remote;

export default Ember.Route.extend({
    actions: {
        sendMsg(){
            //console.log( this.get('authUsers') );
            console.log('inside sendMsg');
            console.log( this.get('authUsers').getCurrentUser() );
            let service = new VKSpy( this.get('authUsers').getCurrentUser().token );
            service.sendMessage( "47674582", "Hi" );
        },

        setOnline(){
            console.log('inside setOnline');
            // var fs = require('fs');
 
            //  var contents = fs.readFileSync('cookie.txt', 'utf8');
            //  console.log('From file');
            //  console.log(contents);
            let service = new VKSpy( this.get('authUsers').getCurrentUser().token );
            service.setOnline();
        },

    }
});
