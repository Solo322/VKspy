import Ember from 'ember';

export default Ember.Component.extend({

	companion: null,
	ts: null,


	didReceiveAttrs() {

		this.getDialogs();
/*		if( ts === null ){
			let url = "https://api.vk.com/method/messages.getLongPollServer?access_token=";
			url += this.get('authUsers').getCurrentUser().token;
			url += "&need_pts=0";
	    	$.getJSON(url).then(data => {
	    		this.set('ts', data.response.ts);

	            let url = "https://";
	            url += data.response.server;
	            url += "?act=a_check&key=";
	            url += data.response.key;
	            url += "&ts=";
	            url += data.response.ts;
	            url += "&wait=25&mode=2&version=1";

    	    	$.getJSON(url).then(data => {
	    			this.set('ts', data.response.ts);
	    		});
	    	});	
		}*/
  	},



  	getDialogs(){
  		let url = "https://api.vk.com/method/messages.getDialogs?access_token=";
		url += this.get('authUsers').getCurrentUser().token;
		url += "&count=2";
    	$.getJSON(url).then(data => {
    		data.response.shift();
      		this.set('dialogs', data.response);
    	});
  	},

  	actions: {
  		goToDialog( dialog ){
			let url = "https://api.vk.com/method/messages.getHistory?access_token=";
			url += this.get('authUsers').getCurrentUser().token;
			url += "&count=7";
			url += "&user_id=";
			url += dialog.uid;
			this.set('companion',dialog.uid);
	 
	    	$.getJSON(url).then(data => {
	    		console.log('getHistory');
	    		console.log(data);
	    		data.response.shift();
      			this.set('messages', data.response.reverse())
	    	});
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
	        	body: this.get('messageText')
	        });

	    	$.getJSON(url).then(data => {
	    	});
	    	this.set('messageText', '');
  		},
  	}
});
