import Ember from 'ember';

export default Ember.Component.extend({

	authService: Ember.inject.service('auth-users'),
	currentUser: Ember.computed.alias('authService.currentUser'),
	currentUserChanged: Ember.observer('currentUser', function() {
		console.log('currentUserChanged');
    	// deal with the change
    	this.getDialogs(); 
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
  		let currentUser = this.get('authUsers').getCurrentUser();
		console.log('getDialogs currentUser');
		console.log(currentUser);
  		if( !currentUser )
  		{
  			this.set('dialogs', null);
  			return;
  		}
		url += currentUser.token;
		url += "&count=2";
    	$.getJSON(url).then(data => {
    		if( data.error )
    			alert('Пользователь не авторизован');
    		console.log( data );
    		data.response.shift();
      		this.set('dialogs', data.response);
    	});
  	},

  	actions: {

  		getCurrentUser(){
  			console.log(this.authService);
  			console.log(this.currentUser);
  			//console.log(this.currentUser.token);
  			console.log(this.get('currentUser'));
  		},
  		goToDialog( dialog ){
			let url = "https://api.vk.com/method/messages.getHistory?access_token=";
			url += this.get('authUsers').getCurrentUser().token;
			url += "&count=7";
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
