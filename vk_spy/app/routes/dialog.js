import Ember from 'ember';

export default Ember.Route.extend({

didUpdateAttrs(){
	alert('didUpdateAttrs');
},
didReceiveAttrs(){
	alert('didReceiveAttrs');
},
willUpdate(){
	alert('willUpdate');
},
willRender(){
	alert('willRender');
},
didUpdate(){
	alert('didUpdate');
},
didRender(){
	alert('didRender');
},



    actions: {
		goToMain(){
		    this.replaceWith('im');
	    }
	}
});
