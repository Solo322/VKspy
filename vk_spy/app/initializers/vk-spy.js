export function initialize( application ) {
    application.inject('component', 'VKSpy', 'service:vk-spy');
    application.inject('route', 'VKSpy', 'service:vk-spy');
    application.inject('controller', 'VKSpy', 'service:vk-spy');
}

export default {
  name: 'vk-spy',
  initialize
};
