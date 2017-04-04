export function initialize(application) {
	application.inject('component', 'authUsers', 'service:auth-users');
	application.inject('route', 'authUsers', 'service:auth-users');
	application.inject('controller', 'authUsers', 'service:auth-users');
}

export default {
  name: 'auth-users',
  initialize
};
