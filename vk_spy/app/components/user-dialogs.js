import Ember from 'ember';

const DIALOG_COUNT = 5;
const MESSAGE_COUNT = 10;

export default Ember.Component.extend({

	authService: Ember.inject.service('auth-users'),
	currentUser: Ember.computed.alias('authService.currentUser'),
	currentUserChanged: Ember.observer('currentUser', function() {
	    Ember.run.once(this, 'getDialogs');
  	}),


	companion: null,
	inDialog: null,
	ts: null,
	dialogs: null,


  	inDialogObserver: Ember.observer('inDialog', function() {
  		if(!this.get('inDialog')){;
			this.getDialogs();
  		}
  	}),


	didReceiveAttrs() {
		this._super(...arguments);
		this.getDialogs();
  	},

	didUpdateAttrs() {
		this._super(...arguments);
		this.getDialogs();
  	},


  	getDialogs(){
  		let url = "https://api.vk.com/method/messages.getDialogs?access_token=";
		console.log('getDialogs currentUser');
		console.log(this.get('currentUser'));
  		if( !this.get('currentUser') ){
  			this.set('dialogs', null);
  			return;
  		}
		url += this.get('currentUser').token;
		url += "&count=" + DIALOG_COUNT;

    	$.getJSON(url).then(data => {
    		if( data.error )
    			alert('Пользователь не авторизован');
    		console.log( data );
    		data.response.shift();
      		this.set('dialogs', data.response);
    	});
  	},

  	actions: {

		// Test func
  		getCurrentUser(){
  			console.log(this.get('currentUser'));
  		},


		consoleDlgInfo( dialog ){
			console.log( 'consoleDlgInfo' );
			console.log( dialog );
			console.log(this.get('vkUsers').getUserByID( dialog.uid ));
			console.log(this.get('vkUsers').users);
		},

  		goToDialog( dialog ){
			let url = "https://api.vk.com/method/messages.getHistory?access_token=";
			url += this.get('authUsers').getCurrentUser().token;
			url += "&count=" + MESSAGE_COUNT;
			url += "&user_id=";
			url += dialog.uid;
			this.set('companion',dialog.uid);
	 		this.set('inDialog', true);

	    	$.getJSON(url).then(data => {
	    		console.log('getHistory');
	    		console.log(data);
	    		data.response.shift();
      			this.set('messages', data.response.reverse())
	    	});
  		},

  		goToBack(){
  			this.set( 'inDialog', false );
  		},

  		sendMessage(){
        	let url = "https://api.vk.com/method/messages.send?access_token=";
	        url += this.get('authUsers').getCurrentUser().token;
	        url += "&message=";
	        url += encodeURIComponent(this.get('messageText'));
	        url += "&user_id=";
	        url += this.companion;

        	// TODO Неправильно! Вдруг сообщение не отправлено!
	        this.get('messages').pushObject({
	        	body: this.get('messageText'),
	        	out: 1
	        });

	    	$.getJSON(url).then(data => {
	    	});
	    	this.set('messageText', '');
  		},
  	}
});
