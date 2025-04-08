# pgAdmin Enhancements

This repository contains enhancements made to pgAdmin, including:
- **Dark Mode Toggle** (by Gautham Binu)
- **SMS 2FA Integration** (by Arathy S)
- **SSL Configuration Wizard Simplification** (Sona F Shukoor)

## 🔥 Features

# 1️⃣ Dark Mode Toggle

1.Created a component called `Themetoggle.jsx`

-![image](https://github.com/user-attachments/assets/7984c3c6-b8f4-4ec0-9705-4b018e6052b5)

this component contains the logic to store the preferences and update it once the toggle button is clicked.

2.Updated `Appmenubar.jsx` so as to include the `Themetoggle.jsx`

![image](https://github.com/user-attachments/assets/e7dad66a-747b-43a0-a382-ef530e2fa4c9)

this renders the toggle component along with the other menubar items .

3.Dark-Mode Theme Change Flow 
```
User clicks theme toggle
  ↓
ThemeToggle component
  ↓
handleThemeChange() triggered
  ↓
Update local preference store
  ↓
Send update to server
  ↓
Trigger preferenceChange event
  ↓
ThemeProvider receives update
  ↓
Apply new theme to entire app
```

4.Testing

-Verified theme switching works correctly.

-Confirmed preferences persist across sessions.

-Tested UI consistency in both themes.

-Validated all components render properly in both modes.

This implementation provides a seamless dark mode experience while maintaining pgAdmin's existing functionality and user interface patterns.



Pgadmin before toggle button :

![pgadminhome](https://github.com/user-attachments/assets/6e18e3ec-64ab-4ab9-9bac-722e50746e79)

After implementing Toggle button :

![pgadminaftertogglelight](https://github.com/user-attachments/assets/9da448a0-f01e-46b2-b270-215df9ac804f)

![pgadminaftertogglelight](https://github.com/user-attachments/assets/fb93161c-2ce8-4553-ab0a-3dc87011dbe7)



## 🎥 Toggle Button Working

Click the link below to watch the demo video:

[🎬 Watch Video](https://github.com/user-content-assets/assets/94d1ac4d-30d2-42f1-9b01-1295283d03ea)





# 2️⃣ SMS-Based Two-Factor Authentication (2FA) 

## 1. Frontend Components and State Management

**File:** `pgadmin4/web/pgadmin/static/js/SecurityPages/MfaRegisterPage.jsx`

- Created a new function for `SmsRegisterView` by studying the structure of `EmailRegisterView`.

 
![image](https://github.com/user-attachments/assets/f44ba55c-6761-4e6e-88e4-cf813481b51e) 

![image](https://github.com/user-attachments/assets/ed07809e-cd4b-4538-8558-90e9ab068ca2)  
*Fig 1.1 Before change*


![Screenshot 2025-03-29 210730](https://github.com/user-attachments/assets/bbb826e0-7526-4522-96eb-5b8b2c7d1f5a)  
*Fig 1.2 After change*

---
## 2. Phone Number Input View

- When selecting the SMS setup, users are redirected to a new page for authentication registration.

**SMS Registration Page:**  
![image1](https://github.com/user-attachments/assets/2c936853-1c70-4730-99f4-801f4c7de8c7)  
*Fig 2.1 SMS Registration page*

### Page Rendering Logic:
- **When `phone_number_placeholder` exists:** Displays the phone input field.
- **When `otp_placeholder` exists:** Displays the verification code input field.

![Screenshot 2025-03-29 195236](https://github.com/user-attachments/assets/55a95f06-a8bb-4db7-abf4-9c667805803e)  
*Fig 2.2 `phone_number_placeholder` - renders the SMS Registration page*

---
## 3. Form Submission

- Introduced a function `handleSubmit()` in `MfaRegisterPage.jsx` to ensure entered values are correctly stored.

![Screenshot 2025-03-29 170813](https://github.com/user-attachments/assets/4b2866c4-f5c2-405d-9c6e-8846b5befd5b)  
*Fig 3.1 Data entered is registered correctly (Triggered when the form is submitted)*

### Validations:
- **Phone Number Format Validation:**
  - Regex pattern: `^\+[1-9]\d{1,14}$`
  - In `sms.py`, `send_to` is used to get the phone number from the form submission

---
## 4. Backend Implementation

**File:** `pgadmin4/web/pgadmin/authenticate/mfa/sms/sms.py`

### Key Functions:
- **Backend Entry Point:** `def send_sms_code() -> Response:`
- **OTP Generation:** `def __generate_otp()`
- **SMS Sending:** `def _send_code_to_phone(_phone: str = None) -> (bool, int, str):`
- **Code Verification:** `def validate(self, **kwargs):`

---
## 5. Testing Twilio API Integration

**File:** `test_sms_manual.py`

- Verifies that the Twilio API logic works correctly.
- Ensures that SMS messages are sent and received successfully.
- Twilio configurations are updated in `config_local.py` 

![WhatsApp Image 2025-03-29 at 21 51 09_ede26dd1](https://github.com/user-attachments/assets/33a4c7d1-3e2f-4089-948b-941b61dbaeb0)  
*Fig 5.1 SMS received correctly*

---
## 6. SMS Authentication Flow

```
Frontend (MfaRegisterPage.jsx)
  ↓
User enters phone number
  ↓
handleSubmit() sends POST to /send_sms_code
  ↓
Backend (sms.py)
  ↓
send_sms_code() validates request
  ↓
_send_code_to_phone() called
  ↓
__generate_otp() creates 6-digit code
  ↓
Twilio sends SMS
  ↓
Frontend (MfaRegisterPage.jsx)
  ↓
User enters verification code
  ↓
handleSubmit() sends POST with code
  ↓
Backend (sms.py)
  ↓
validate() checks code
  ↓
Success/Failure response
```
---
---

# 3️⃣ SSL Configuration Wizard 

### **Overview**
The SSL Configuration Wizard for remote server connection has been enhanced to simplify selecting SSL modes for registering PostgreSQL connections.

## 1. Adding Tooltip Description 
![WhatsApp Image 2025-04-02 at 22 08 27_e5e19a8d](https://github.com/user-attachments/assets/c27a5ac5-ea15-4f1d-9274-cb3229e748b9)

*Fig 1.1 SSL Modes without tooltips*

![WhatsApp Image 2025-04-02 at 22 04 56_9b9751c6](https://github.com/user-attachments/assets/b67c82ee-28a5-4b75-aae0-8aab533d529e)

![WhatsApp Image 2025-04-02 at 22 04 32_68aefab4](https://github.com/user-attachments/assets/859cf7ce-3e29-4478-b92f-a806aa967c13)

*Fig 1.2 SSL Modes dropdown: allow and verify-ca with tooltip description*

## 2. Backend Implementation

Create descriptions for each SSL mode based on the PostgreSQL documentation:
- allow: "SSL is optional, but it will only be used if the server requires it"
- prefer: "SSL is optional but preferred. Will attempt to use SSL first, falling back to non-SSL if unsuccessful"
- require: "SSL encryption is required for the connection. The connection will fail if SSL cannot be established"
- disable: "SSL is disabled and the connection will be unencrypted"
- verify-ca: "SSL encryption is required, and the server certificate must be verified by checking it against trusted certificate authorities (CA)"
- verify-full: "The highest level of security. SSL encryption is required, server certificate must be verified, and the server hostname must match the certificate"

Modify the server UI implementation file to add descriptions for the SSL modes configuration in the `getConnectionParameters()` function in `server.ui.js`. All text is wrapped in gettext() to ensure proper internationalization support. However, to display these descriptions in the UI, we use a frontend component `react-select` with a built-in tooltip function that renders the select field.

![WhatsApp Image 2025-04-02 at 23 13 48_ceb125a8](https://github.com/user-attachments/assets/9edf16d3-c3a1-480e-af00-38133ea2d565)
*Fig 2.1 Description and tooltip in server.ui.js*

## 3.Rendering Frontend Components

The select component uses `react-select` with custom components. The descriptions can be shown as tooltips using the built-in tooltip functionality of `react-select`.

Modify the `CustomSelectOption` component in `FormComponents.jsx` to wrap each option in a Tooltip component and show tooltips.

![WhatsApp Image 2025-04-02 at 23 17 32_88197f19](https://github.com/user-attachments/assets/a9d888f9-f52b-45e7-ad05-f9becc4c3dce)
*Fig 3.1 Modified CustomSelectOption function in FormComponents.jsx*

Modify the `InputSelect` component to ensure that each option is rendered with its respective tooltip.

![WhatsApp Image 2025-04-02 at 23 19 29_f65b0679](https://github.com/user-attachments/assets/a22bc4c6-1baa-4771-9696-6b86bacc88d3)
![WhatsApp Image 2025-04-02 at 23 20 58_6b43adfd](https://github.com/user-attachments/assets/d3d0827f-e3f2-4fe8-bfd9-85464c712ab9)
*Fig 3.2 Modified FormComponents.jsx*

## 4. Implementation Flow

```
User selects SSL mode from dropdown (`FormComponents.jsx`)
  ↓
Frontend calls `getConnectionParameters()` function to fetch SSL mode options with descriptions and tooltips (`server.ui.js`)
  ↓
SSL mode options with descriptions and tooltips are passed to `VariableSchema` class (`server.ui.js`)
  ↓
`VariableSchema` class processes options and prepares them for the dropdown (`server.ui.js`)
  ↓
SSL mode options are rendered using `CustomSelectOption` (`FormComponents.jsx`)
  ↓
User hovers over SSL mode option to see the tooltip (Tooltip is shown only on hover) (`FormComponents.jsx`)
  ↓
Tooltip content for the selected SSL mode is displayed on hover 
```

# Pgadmin4 Setup instructions:

pgAdmin 4 is a rewrite of the popular pgAdmin3 management tool for the
PostgreSQL (http://www.postgresql.org) database.

In the following documentation and examples, *$PGADMIN4_SRC/* is used to denote
the top-level directory of a copy of the pgAdmin source tree, either from a
tarball or a git checkout.

## Architecture

pgAdmin 4 is written as a web application with Python(Flask) on the server side
and ReactJS, HTML5 with CSS for the client side processing and UI.

Although developed using web technologies, pgAdmin 4 can be deployed either on
a web server using a browser, or standalone on a workstation. The runtime/
subdirectory contains an Electron based runtime application intended to allow this,
which will fork a Python server process and display the UI.

## Prerequisites
1. Install Node.js 20 and above (https://nodejs.org/en/download)
2. yarn (https://yarnpkg.com/getting-started/install)
3. Python 3.8 and above (https://www.python.org/downloads/)
4. PostgreSQL server (https://www.postgresql.org/download)

Start by enabling Corepack, if it isn't already;
this will add the yarn binary to your PATH:
```bash
corepack enable
```

# Building the Web Assets

pgAdmin is dependent on a number of third party Javascript libraries. These,
along with it's own Javascript code, CSS code and images must be
compiled into a "bundle" which is transferred to the browser for execution
and rendering. This is far more efficient than simply requesting each
asset as it's needed by the client.

To create the bundle, you will need the 'yarn' package management tool to be
installed. Then, you can run the following commands on a *nix system to
download the required packages and build the bundle:

```bash
(venv) $ cd $PGADMIN4_SRC
(venv) $ make install-node
(venv) $ make bundle
```

On Windows systems (where "make" is not available), the following commands
can be used:

```
C:\> cd $PGADMIN4_SRC\web
C:\$PGADMIN4_SRC\web> yarn install
C:\$PGADMIN4_SRC\web> yarn run bundle
```

# Configuring the Python Environment

In order to run the Python code, a suitable runtime environment is required.
Python version 3.8 and later are currently supported. It is recommended that a
Python Virtual Environment is setup for this purpose, rather than using the
system Python environment. On Linux and Mac systems, the process is fairly
simple - adapt as required for your distribution:

1. Create a virtual environment in an appropriate directory. The last argument is
   the name of the environment; that can be changed as desired:

   ```bash
   $ python3 -m venv venv
   ```

2. Now activate the virtual environment:

   ```bash
   $ source venv/bin/activate
   ```

3. Some of the components used by pgAdmin require a very recent version of *pip*,
   so update that to the latest:

   ```bash
   $ pip install --upgrade pip
   ```

4. Ensure that a PostgreSQL installation's bin/ directory is in the path (so
   pg_config can be found for building psycopg3), and install the required
   packages:

   ```bash
   (venv) $ PATH=$PATH:/usr/local/pgsql/bin pip install -r $PGADMIN4_SRC/requirements.txt
   ```

   If you are planning to run the regression tests, you also need to install
   additional requirements from web/regression/requirements.txt:

   ```bash
   (venv) $ pip install -r $PGADMIN4_SRC/web/regression/requirements.txt
   ```

5. Create a local configuration file for pgAdmin. Edit
   $PGADMIN4_SRC/web/config_local.py and add any desired configuration options
   (use the config.py file as a reference - any settings duplicated in
   config_local.py will override those in config.py). A typical development
   configuration may look like:

    ```python
   import os
   import logging

   # Change pgAdmin data directory
   DATA_DIR = '/Users/myuser/.pgadmin_dev'

   #Change pgAdmin server and port
   DEFAULT_SERVER = '127.0.0.1'
   DEFAULT_SERVER_PORT = 5051

   # Switch between server and desktop mode
   SERVER_MODE = True

   #Change pgAdmin config DB path in case external DB is used.
   CONFIG_DATABASE_URI="postgresql://postgres:postgres@localhost:5436/pgadmin"

   #Setup SMTP
   MAIL_SERVER = 'smtp.gmail.com'
   MAIL_PORT = 465
   MAIL_USE_SSL = True
   MAIL_USERNAME = 'user@gmail.com'
   MAIL_PASSWORD = 'xxxxxxxxxx'

   # Change log level
   CONSOLE_LOG_LEVEL = logging.INFO
   FILE_LOG_LEVEL = logging.INFO

   # Use a different config DB for each server mode.
   if SERVER_MODE == False:
     SQLITE_PATH = os.path.join(
         DATA_DIR,
         'pgadmin4-desktop.db'
     )
   else:
     SQLITE_PATH = os.path.join(
         DATA_DIR,
         'pgadmin4-server.db'
     )
   ```

   This configuration allows easy switching between server and desktop modes
   for testing.

6. The initial setup of the configuration database is interactive in server
   mode, and non-interactive in desktop mode. You can run it either by
   running:

   ```bash
   (venv) $ python3 $PGADMIN4_SRC/web/setup.py
   ```

   or by starting pgAdmin 4:

   ```bash
   (venv) $ python3 $PGADMIN4_SRC/web/pgAdmin4.py
   ```

Whilst it is possible to automatically run setup in desktop mode by running
the runtime, that will not work in server mode as the runtime doesn't allow
command line interaction with the setup program.

At this point you will be able to run pgAdmin 4 from the command line in either
server or desktop mode, and access it from a web browser using the URL shown in
the terminal once pgAdmin has started up.

Setup of an environment on Windows is somewhat more complicated unfortunately,
please see *pkg/win32/README.txt* for complete details.

# Building the documentation

In order to build the docs, an additional Python package is required in the
virtual environment. This can be installed with the pip package manager:

```bash
$ source venv/bin/activate
(venv) $ pip install Sphinx
(venv) $ pip install sphinxcontrib-youtube
```

The docs can then be built using the Makefile in *$PGADMIN4_SRC*, e.g.

```bash
(venv) $ make docs
```

The output can be found in *$PGADMIN4_SRC/docs/en_US/_build/html/index.html*

## Building the Runtime
Change into the runtime directory, and run *yarn install*. This will install the
dependencies required.

In order to use the runtime in a development environment, you'll need to copy
*dev_config.json.in* file to *dev_config.json*, and edit the paths to the Python
executable and *pgAdmin.py* file, otherwise the runtime will use the default
paths it would expect to find in the standard package for your platform.

You can then execute the runtime by running something like:

```bash
yarn run start
```

# Building packages

Most packages can be built using the Makefile in $PGADMIN4_SRC, provided all
the setup and configuration above has been completed.

To build a source tarball:

```bash
(venv) $ make src
```

To build a PIP Wheel, activate either a Python 3 virtual environment, configured
with all the required packages, and then run:

```bash
(venv) $ make pip
```

To build the macOS AppBundle, please see *pkg/mac/README*.

To build the Windows installer, please see *pkg/win32/README.txt*.
# Create Database Migrations

In order to make changes to the SQLite DB, navigate to the 'web' directory:

```bash
(venv) $ cd $PGADMIN4_SRC/web
```

Create a migration file with the following command:

```bash
(venv) $ FLASK_APP=pgAdmin4.py flask db revision
```

This will create a file in: $PGADMIN4_SRC/web/migrations/versions/ .
Add any changes to the 'upgrade' function.
Increment the SCHEMA_VERSION in $PGADMIN4_SRC/web/pgadmin/model/__init__.py file.

There is no need to increment the SETTINGS_SCHEMA_VERSION.

# Support

See https://www.pgadmin.org/support/ for support options.

# Security Issues

If you would like to report a security issue with pgAdmin, please email
**security (at) pgadmin (dot) org**.

Note that this address should only be used for reporting security issues
that you believe you've found in the design or code of pgAdmin, pgAgent,
and the pgAdmin website. It should not be used to ask security questions.

# Project info

A GitHub project for pgAdmin 4 can be found at the address below:

https://github.com/pgadmin-org/pgadmin4

Please submit any changes as Pull Requests against the *master* branch of the
*pgadmin-org/pgadmin4* repository.

If you wish to discuss pgAdmin 4, or contribute to the project, please use the
pgAdmin Hackers mailing list:

pgadmin-hackers@postgresql.org
