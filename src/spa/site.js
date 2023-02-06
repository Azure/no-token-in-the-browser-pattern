// The base API Management URI
const baseUri = "https://api.codeshed.dev";

// The Azure AD client ID
const clientId = "dadcc5f1-60b6-4f68-8c11-720c2f4aaa82";

// The scope for the access token request
const scope = "https://graph.microsoft.com/.default"

// Redirects the user to the login endpoint with the appropriate parameters
const login = () => {
    window.location.href =
        `https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?response_type=code&redirect_uri=${baseUri}/auth/callback&client_id=${clientId}&scope=${scope}`;
};

// Logs the user out of the application by redirecting to the logout endpoint of Azure AD which will in turn call the logout endpoint of the application to remove the cookie
const logout = () => {
    window.location.href = `https://login.microsoftonline.com/organizations/oauth2/v2.0/logout?post_logout_redirect_uri=${baseUri}/auth/logout`;
};

// Calls the graph endpoint and displays the result
const callApi = async () => {
    // Display loading message
    document.getElementById("result").innerText = "Loading...";

    // Call the Graph API endpoint
    await fetch(`${baseUri}/graph/me`, {
        credentials: "include",
    })
        .then(async (response) => {
            if (response.status === 401) {
                document.getElementById("result").innerText = "User is not authenticated.";
            } else {
                document.getElementById("result").innerText = JSON.stringify(await response.json(), null, 4);
            }
        })
        .catch((error) => {
            document.getElementById("result").innerText = error;
        });
};

// Exports the functions to be used in the HTML
export { login, logout, callApi };