import Ember from 'ember';
import VKUser from './../objects/vk-user';

export default Ember.Service.extend({
	users: [],

	getUserByID( id, callback ){

		let finded_user = this.get('users').findBy( 'id', id );
		if( finded_user )
		{
			callback( finded_user );
			return;
		}

		let url = "https://api.vk.com/method/users.get?";
		url += "&user_ids=" + id;
		url += "&fields=photo_50"
    	$.getJSON(url).then(data => {
    		if(data.response)
    		{
    			for (let i = 0; i < data.response.length; i++) 
    			{
    				let user = VKUser.create({
		                        firstName: data.response[i].first_name,
		                        lastName: data.response[i].last_name,
		                        id: data.response[i].uid,
		                        photo_50: data.response[i].photo_50,
		                        //token: ''
                	});
					this.get('users').pushObject( user );
					callback( user );
    			}
    		}
    	});
	}
});
