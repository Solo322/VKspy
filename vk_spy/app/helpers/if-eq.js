import Ember from 'ember';

export default Ember.Helper.helper(function(params) {
    let [arg1, arg2] = params;

    if( arg1 === arg2 )
        return "selected";
    return "";
});