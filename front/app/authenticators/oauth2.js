import OAuth2PasswordGrantAuthenticator from 'ember-simple-auth/authenticators/oauth2-password-grant';
import ENV from 'front/config/environment';

export default OAuth2PasswordGrantAuthenticator.extend({
  serverTokenRevocationEndpoint: `${ENV.host}/revoke`,
  serverTokenEndpoint: `${ENV.host}/token`,
  refreshAccessTokens: true
});
