# No Token in the Browser Pattern using Azure API Management

This project is a simple example of how you can use Azure API Management to implement a no token in the browser pattern for a JavaScript single-page application.

This pattern uses [Azure API Management](https://azure.microsoft.com/en-us/products/api-management) in a [Backend for Frontend](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends) pattern where it handles the OAuth2 access token acquisition from Azure Active Directory; [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) encryption and decryption of the access token into an `HttpOnly` cookie; and to proxy all API calls requiring authorization. This is performed by the use of [Azure API Management Policies](https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-policies).

As the backend handles the token acquisition, no other code or library, such as [MSAL.js](https://github.com/AzureAD/microsoft-authentication-library-for-js), is required in the single-page application itself. This also means that no tokens are required to be stored in the browser session or local storage. By encrypting and storing the access token in an `HttpOnly` cookie protects it from [XSS](https://owasp.org/www-community/attacks/xss/) attacks, and scoping it to the API domain and setting `SameSite=strict` ensures that the cookie is automatically sent with all proxied API first-party requests. More on SameSite cookies can be read [here](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite).

This example uses [Microsoft Graph API](https://learn.microsoft.com/en-US/graph/api/overview?view=graph-rest-1.0) as an example backend API, but the same principles apply to any backend API you want to call. To obtain an access token with the required scopes, the correct API permissions need to be added to the application registration in Azure Active Directory.

For information on how to configure the API Management instance and Application Registration, please consult the [configuration](docs/configuration.md) page.

The pattern works as follows:

1. User selects sign-in in single-page application.
2. Single-page application invokes Authorization Code flow with a redirect to Azure Active Directory authorize endpoint.
3. User authenticates themselves.
4. Authorization Code flow response redirects to Azure API Management callback endpoint with authorization code.
5. Azure API Management policy exchanges authorization code for access token by calling Azure Active Directory token endpoint.
6. Azure API Management policy redirects back to single-page appliction and sets encrypted access token in an HttpOnly cookie.
7. User invokes external API call from single-page application through Azure API Management proxied endpoint.
8. Azure API Management policy receives API request, decrypts cookie, and makes downstream API call with access token added as Authorization header.

![Pattern Architecture](docs/images/no-token-in-the-browser.png)

## Enhancements

This example project is not a production-ready solution, merely a demonstration of what is possible using these services. The following points should be considered to enhance any solution before using it in production:

- This example does not cater for token expiry nor the use of refresh or id tokens.

- As this only demonstrates the retrieval of data using a `GET` request it does not include protection from [CSRF](https://owasp.org/www-community/attacks/csrf) attacks which would be required if other http methods such as `POST`, `PUT`, `PATCH`, or `DELETE` were to be implemented.
