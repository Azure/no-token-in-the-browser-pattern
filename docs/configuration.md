# Resource Configuration

The sections below detail how to configure the resources required to implement this example. This project uses the domain `codeshed.dev` throughout, with the single-page application hosted at `spa.codeshed.dev` and the API Management gateway registered as `api.codeshed.dev`. These values will need to be replaced with your own domain and subdomain names as appropriate. A working version of the example can be found at [https://spa.codeshed.dev](https://spa.codeshed.dev).

## Application Registration

You will need to register an application in Azure Active Directory to generate an application client id. This application needs to have the following properties configured:

- Redirect URI
- Front Channel Logout URL
- API Permissions
- Client Secret

When creating the application registration the sign in audience chosen will determine the Azure Active Directory endpoints required for authorization and token acquisition. This example project uses a multi-tenant application registration, which allows for users of multiple directories to access it. If single tenant is chosen then the tenant id would need to be used in these endpoints in place of the generic `organizations` used for multi-tenanted applications.

Even though this example is a single-page application, due to the backend for frontend pattern, the OAuth2 application is considered a confidential client as token acquisition is handled by the API Management gateway, which can keep the client secret value secure either as a secret named value, or by linking it to a secret in a Key Vault.

The redirect uri should be configured as a `Web` redirect and pointed to the domain of the API Management gateway and the API callback operation, for example: `https://<APIM DOMAIN>/auth/callback`.

To enable the single-page application to log out of the API Management gateway, the front channel logout url should be configured to the domain of the Azure API Management gateway logout operation, for example: `https://<APIM DOMAIN>/auth/logout`. This will ensure that the cookie is removed from the browser when the user logs out of Azure Active Directory.

As this example uses Microsoft Graph API as the proxied API to call, we need to add the permission `User.Read` to the application. Depending upon how you create the application registration this will probably be added for you by default.

Finally a client secret is required to be generated for the API Management gateway to enable the authorization code to be exchanged for an access token. This secret is not required in the single-page application, but will be stored as a named value in the API Management gateway.

## API Management

Once the API Management gateway has been created several parameters need to be registered under [Named Values](https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-properties) to be referenced by the policies. Theses values are:

- `client-id`
  - The application registration client id.
- `client-secret`
  - The secret generated in the application registration.
- `cookie-domain`
  - The domain to scope the cookie.
- `cookie-name`
  - The name of the cookie.
- `return-uri`
  - The uri to redirect back to after token acquisition is complete and to define the CORS policy allowed origins.
- `enc-key`
  - The [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) encryption key in base64 encoded format. AES supports three different key lengths: 128, 192, and 256 bits.

There are two APIs defined - both are listed in the [/src/api](/src/api) directory. The first is for the authorization functionality, and should be defined with an API URL Suffix of `auth`. Within this two `GET` methods are defined: `callback` and `logout`. Each of these has its own policy to be applied. This definition does not need a web service URL defined as it never passes the API request onto a backend service.

The `callback` policy acts as the redirect for the Azure Active Directory application, and receives the authorization code following user authentication. This policy then exchanges the code for an access token before encrypting it into a cookie and returning it to the single-page application. The `logout` policy simply removes the cookie from the browser.

The second API definition is for the Microsoft Graph API and acts as a proxy for all requests to this service. This should be defined with an API URL Suffix of `graph` and a web service URL of `https://graph.microsoft.com/v1.0/`. The base policy should be applied to all operations defined for this API definition. This defines the CORS policy, performs the decryption of the cookie, and addition of the extracted access token to the Authorization header before proxying the API request to the defined backend service.

Each operation defined should simply match the Graph API request path, with no further policy changes applied as it simply proxies the request through, appending the access token into the relevant header.