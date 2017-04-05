import Ember from 'ember';

export default Ember.Route.extend({
    actions: {
        sendMsg(){
            console.log('inside sendMsg');
            let service = new VKSpy( this.get('authUsers').getCurrentUser().token );
            service.sendMessage( "47674582", "Hi" );
        },

        setOnline(){
            console.log('inside setOnline');
            let service = new VKSpy( this.get('authUsers').getCurrentUser().token );
            service.setOnline();
        },

        getDialogs(){
            this.replaceWith('dialog');
            let service = new VKSpy( this.get('authUsers').getCurrentUser().token );
            service.getDialogs(function( body ){
                console.log('getDialogs');
                console.log(body);
            });
        },

        longPopServer(){
            let service = new VKSpy( this.get('authUsers').getCurrentUser().token );
            service.longPopServer();
        }
    }
});
