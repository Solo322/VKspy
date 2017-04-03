import Ember from 'ember';

export default Ember.Controller.extend(Ember.Evented, {

	helloWorld(){
		alert('helloWorld');
	},
  actions: {
    toggleBody() {
      this.toggleProperty('isExpanded');
      console.log('toggleBody');
      this.trigger('loginDidFail');
    },
    sendData(data) {
      alert(data);
    }
  }
});
