import Ember from 'ember';

export default Ember.Service.extend({

	user: null,
	isOnline: null,
	isTyping: null,
	isReading: null,

    usersChanged: function() {
        // При каких либо изменения в users запишем это в файл
        // TODO сделать запись один раз при выходе из программы!
        this.writeCfg();
    }.observes('user'),

    isOnlineChange: function(){
    	this.writeCfg();
    }.observes('isOnline'),

    isTypingChange: function(){
    	this.writeCfg();
    }.observes('isTyping'),

        isReadingChange: function(){
    	this.writeCfg();
    }.observes('isReading'),


	init(){
		this.readCfg();
	},

	willDestroy(){

	},

	readCfg(){
		console.log( 'vk-spy::readCfg' );
        let fs = require('fs');
        if (fs.existsSync('cfg.json')) {
            let contents = fs.readFileSync('cfg.json', 'utf-8');
            if( contents.length ){
            	let obj = JSON.parse(contents);
            	this.set('user', obj.user);
            	this.set('isOnline', obj.isOnline);
            	this.set('isTyping', obj.isTyping);
            	this.set('isReading', obj.isReading);
            	console.log( obj );
            }
        }
	},

	writeCfg(){
		console.log( 'vk-spy::writeCfg' );
        var fs = require('fs');
        let obj = {
        	user: this.get('user'),
        	isOnline: this.get('isOnline'),
        	isTyping: this.get('isTyping'),
        	isReading: this.get('isReading'),
        };
        fs.writeFile('cfg.json', JSON.stringify(obj, null, 2), 'utf8', function(){} ); 
	},
});
