/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2025, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

import axios from 'axios';

// CSRF token handling for AJAX requests
let csrfToken = null;
let csrfHeader = null;

export function setPGCSRFToken(header, token) {
    console.log('Setting CSRF token:', { header, token });
    if (!token) {
        console.error('No CSRF token provided');
        return;
    }

    csrfToken = token;
    csrfHeader = header;

    // Configure axios defaults
    if (window.axios) {
        window.axios.defaults.headers.common[csrfHeader] = csrfToken;
        console.log('Axios CSRF token configured');
    }
}

export function getPGCSRFToken() {
    return { header: csrfHeader, token: csrfToken };
}

// Add interceptor to handle CSRF errors
if (window.axios) {
    window.axios.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 401) {
                console.log('CSRF token error detected');
                // Try to get a new CSRF token
                fetch('/browser/js/csrf_token', {
                    method: 'GET',
                    credentials: 'same-origin',
                })
                .then(response => response.json())
                .then(data => {
                    if (data.csrf_token) {
                        setPGCSRFToken('X-CSRFToken', data.csrf_token);
                        // Retry the original request
                        const config = error.config;
                        config.headers[csrfHeader] = csrfToken;
                        return window.axios.request(config);
                    }
                })
                .catch(err => {
                    console.error('Failed to refresh CSRF token:', err);
                    // Redirect to login page if token refresh fails
                    window.location.href = '/login';
                });
            }
            return Promise.reject(error);
        }
    );
}