##############################################################################
#
# pgAdmin 4 - PostgreSQL Tools
#
# Copyright (C) 2013 - 2025, The pgAdmin Development Team
# This software is released under the PostgreSQL Licence
#
##############################################################################
"""Multi-factor Authentication implementation by sending OTP through SMS"""

from flask import url_for, session, Response, render_template, current_app, \
    flash
from flask_babel import gettext as _
from flask_login import current_user
import os
from twilio.rest import Client
import random

import config
from pgadmin.utils.csrf import pgCSRFProtect
from .registry import BaseMFAuth
from .utils import ValidationException, mfa_add, fetch_auth_option
from pgadmin.utils.constants import MessageType


def __generate_otp() -> str:
    """
    Generate a six-digits one-time-password (OTP) for the current user.

    Returns:
        str: A six-digits OTP for the current user
    """
    # Generate a random 6-digit OTP
    otp = random.randint(100000, 999999)
    return str(otp)


def _send_code_to_phone(_phone: str = None) -> (bool, int, str):
    """
    Send the code to the phone number, provided in the argument.

    Args:
        _phone (str, optional): Phone number, where to send the OTP code.
                                Defaults to None.

    Returns:
        (bool, int, str): Returns a set as (failed?, HTTP Code, message string)
                          If 'failed?' is True, message contains the error
                          message for the user, else it contains the success
                          message for the user to consume.
    """

    if not current_user.is_authenticated:
        return False, 401, _("Not accessible")

    if _phone is None:
        return False, 401, _("No phone number is available.")

    try:
        # Generate OTP and store in session
        session["mfa_sms_code"] = __generate_otp()
        
        # Get Twilio credentials from config
        account_sid = getattr(config, 'TWILIO_ACCOUNT_SID', None)
        auth_token = getattr(config, 'TWILIO_AUTH_TOKEN', None)
        from_number = getattr(config, 'TWILIO_FROM_NUMBER', None)
        
        if not account_sid or not auth_token or not from_number:
            return False, 503, _("Twilio configuration is incomplete.")
            
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Send SMS with OTP
        message = client.messages.create(
            body=_("{} - Your verification code is: {}").format(
                config.APP_NAME, session["mfa_sms_code"]
            ),
            from_=from_number,
            to=_phone
        )
        
        current_app.logger.info(f"SMS sent with SID: {message.sid}")
        
    except Exception as e:
        current_app.logger.exception(e)
        return False, 503, _("Failed to send the code via SMS.") + \
            "\n" + str(e)

    message = _(
        "A verification code was sent to {}. Check your phone and enter "
        "the code."
    ).format(_mask_phone(_phone))

    return True, 200, message


def _mask_phone(_phone: str) -> str:
    """
    Mask a phone number for display purposes.

    Args:
        _phone (str): Phone number to be masked

    Returns:
        str: Masked phone number
    """
    # Keep first 3 and last 2 digits visible, mask the rest
    if len(_phone) > 5:
        return _phone[:3] + '*' * (len(_phone) - 5) + _phone[-2:]
    else:
        return '*' * len(_phone)  # Mask all if too short


def send_sms_code() -> Response:
    """
    Send the code to the users' phone number, stored during the registration.

    Raises:
        ValidationException: Raise this exception when user is not registered
        for this authentication method.

    Returns:
        Flask.Response: Response containing the HTML portion after sending the
                        code to the registered phone number of the user.
    """

    options, found = fetch_auth_option(SMS_AUTH_METHOD)

    if found is False:
        raise ValidationException(_(
            "User has not registered for SMS authentication"
        ))

    success, http_code, message = _send_code_to_phone(options)

    if success is False:
        return Response(message, http_code, mimetype='text/html')

    return dict(message=message)


@pgCSRFProtect.exempt
def javascript() -> Response:
    """
    Returns the javascript code for the SMS authentication method.

    Returns:
        Flask.Response: Response object containing the javascript code for the
                        SMS auth method.
    """
    if not current_user.is_authenticated:
        return Response(_("Not accessible"), 401, mimetype="text/plain")

    return Response(render_template(
        "mfa/sms.js", _=_, url_for=url_for,
    ), 200, mimetype="text/javascript")


SMS_AUTH_METHOD = 'sms'


def sms_authentication_label():
    return _('SMS Authentication')


class SMSAuthentication(BaseMFAuth):

    @property
    def name(self):
        return SMS_AUTH_METHOD

    @property
    def label(self):
        return sms_authentication_label()

    def validate(self, **kwargs):
        code = kwargs.get('code', None)
        sms_otp = session.get("mfa_sms_code", None)
        if code is not None and sms_otp is not None and code == sms_otp:
            session.pop("mfa_sms_code")
            return
        raise ValidationException("Invalid code")

    def validation_view(self):
        session.pop("mfa_sms_code", None)
        return dict(
            description=_("Verify with SMS Authentication"),
            button_label=_("Send Code"),
            button_label_sending=_("Sending Code...")
        )

    def _registration_view(self):
        # Use both semantically appropriate property names and backward-compatible names
        return dict(
            label=sms_authentication_label(),
            auth_method=SMS_AUTH_METHOD,
            description=_("Enter your phone number to receive a verification code"),
            # Include both new semantically appropriate property names
            phone_number_placeholder=_("Phone number (with country code)"),
            phone_number="",
            # And backward-compatible property names for template rendering
            email_address_placeholder=_("Phone number (with country code)"),
            email_address="",
            note_label=_("Note"),
            note=_(
                "This phone number will only be used for two factor "
                "authentication purposes."
            ),
        )

    def _registration_view_after_code_sent(self, _form_data):
        # Use both semantically appropriate property names and backward-compatible names
        session['mfa_phone_number'] = _form_data.get('send_to', None)
        success, http_code, message = _send_code_to_phone(
            session['mfa_phone_number']
        )

        if success is False:
            flash(message, MessageType.ERROR)
            return None

        return dict(
            label=sms_authentication_label(),
            auth_method=SMS_AUTH_METHOD,
            message=message,
            # Include both new semantically appropriate property names
            verification_code_placeholder=_("Enter verification code"),
            verification_code_sent=True,  # Flag to indicate verification code was sent
            # And backward-compatible property names for template rendering
            otp_placeholder=_("Enter verification code"),
            http_code=http_code,
        )

    def registration_view(self, _form_data):
        # Add debugging to track the registration flow
        current_app.logger.debug(f"SMS registration_view called with form data: {_form_data}")

        if 'validate' in _form_data:
            if _form_data['validate'] == 'send_code':
                result = self._registration_view_after_code_sent(_form_data)
                current_app.logger.debug(f"SMS _registration_view_after_code_sent returned: {result}")
                return result

            code = _form_data.get('code', 'unknown')

            if code is not None and \
                    code == session.get("mfa_sms_code", None) and \
                    session.get("mfa_phone_number", None) is not None:
                mfa_add(SMS_AUTH_METHOD, session['mfa_phone_number'])

                flash(_(
                    "SMS Authentication registered successfully."
                ), MessageType.SUCCESS)

                session.pop('mfa_sms_code', None)

                return None

            flash(_('Invalid code'), MessageType.ERROR)

        # Initial registration view
        result = self._registration_view()
        current_app.logger.debug(f"SMS _registration_view returned: {result}")
        return result

    def register_url_endpoints(self, blueprint):
        blueprint.add_url_rule(
            "/send_sms_code", "send_sms_code", send_sms_code,
            methods=("POST", )
        )
        blueprint.add_url_rule(
            "/sms.js", "sms_js", javascript, methods=("GET", )
        )

    @property
    def icon(self):
        return url_for("mfa.static", filename="images/sms_lock.svg")

    @property
    def validate_script(self):
        return url_for("mfa.sms_js")
