/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2025, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////
import React, { useState } from 'react';
import LoginImage from '../../img/login.svg?svgr';
import { InputSelect, InputText, MESSAGE_TYPE, NotifierMessage } from '../components/FormComponents';
import BasePage, { SecurityButton } from './BasePage';
import { useDelayedCaller } from '../custom_hooks';
import gettext from 'sources/gettext';
import PropTypes from 'prop-types';
import url_for from 'sources/url_for';

function EmailValidateView({mfaView, sendEmailUrl, csrfHeader, csrfToken}) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const showResendAfter = useDelayedCaller(()=>{
    setShowResend(true);
  });

  const sendCodeToEmail = ()=>{
    setSending(true);
    let accept = 'text/html; charset=utf-8;';

    fetch(sendEmailUrl, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': accept,
        'Content-Type': 'application/json; charset=utf-8;',
        [csrfHeader]: csrfToken,
      },
      redirect: 'follow'
    }).then((resp) => {
      if (!resp.ok) {
        resp.text().then(msg => setError(msg));
        return;
      }
      return resp.json();
    }).then((resp) => {
      if (!resp)
        return;
      setSentMessage(resp.message);
      showResendAfter(20000);
    }).finally(()=>{
      setSending(false);
    });
  };

  return <>
    <div style={{textAlign: 'center'}} data-test="email-validate-view">{mfaView.description}</div>
    {sentMessage && <>
      <div>{sentMessage}</div>
      {showResend && <div>
        <span>{gettext('Haven\'t received an email?')} <a style={{color:'inherit', fontWeight: 'bold'}} href="#" onClick={sendCodeToEmail}>{gettext('Send again')}</a></span>
      </div>}
      <InputText value={inputValue} name="code" placeholder={mfaView.otp_placeholder}
        onChange={setInputValue} autoFocus
      />
      <SecurityButton value='Validate'>{gettext('Validate')}</SecurityButton>
    </>}
    {error && <NotifierMessage message={error} type={MESSAGE_TYPE.ERROR} closable={false} />}
    {!sentMessage &&
    <SecurityButton type="button" name="send_code" onClick={sendCodeToEmail} disabled={sending}>
      {sending ? mfaView.button_label_sending : mfaView.button_label}
    </SecurityButton>}
  </>;
}

EmailValidateView.propTypes = {
  mfaView: PropTypes.object,
  sendEmailUrl: PropTypes.string,
  csrfHeader: PropTypes.string,
  csrfToken: PropTypes.string
};

function AuthenticatorValidateView({mfaView}) {
  const [inputValue, setInputValue] = useState('');

  return <>
    <div data-test="auth-validate-view">{mfaView.auth_description}</div>
    <InputText value={inputValue} name="code" placeholder={mfaView.otp_placeholder}
      onChange={setInputValue} autoFocus
    />
    <SecurityButton value='Validate'>{gettext('Validate')}</SecurityButton>
  </>;
}

AuthenticatorValidateView.propTypes = {
  mfaView: PropTypes.object,
};

function SMSValidateView({mfaView, csrfHeader, csrfToken}) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showResend, setShowResend] = useState(false);

  // Ensure we have a valid mfaView object with all required properties
  if (!mfaView) {
    console.error('mfaView is undefined in SMSValidateView');
    return null;
  }

  // HARDCODE the SMS endpoint URL to avoid any issues
  const smsEndpoint = window.location.origin + '/mfa/send_sms_code';
  console.log('Using absolute SMS URL for validation:', smsEndpoint);

  const showResendAfter = useDelayedCaller(()=>{
    setShowResend(true);
  });

  const sendCodeToPhone = ()=>{
    setSending(true);
    let accept = 'text/html; charset=utf-8;';
    
    console.log('Sending SMS code request to:', smsEndpoint);
    
    // Use the absolute URL
    fetch(smsEndpoint, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Accept': accept,
        'Content-Type': 'application/json; charset=utf-8;',
        [csrfHeader]: csrfToken,
      },
      redirect: 'follow'
    }).then((resp) => {
      if (!resp.ok) {
        resp.text().then(msg => setError(msg));
        return;
      }
      return resp.json();
    }).then((resp) => {
      if (!resp)
        return;
      setSentMessage(resp.message);
      showResendAfter(20000);
    }).finally(()=>{
      setSending(false);
    });
  };

  return <>
    <div style={{textAlign: 'center'}} data-test="sms-validate-view">{mfaView.description}</div>
    {sentMessage && <>
      <div>{sentMessage}</div>
      {showResend && <div>
        <span>{gettext('Haven\'t received a text?')} <a style={{color:'inherit', fontWeight: 'bold'}} href="#" onClick={sendCodeToPhone}>{gettext('Send again')}</a></span>
      </div>}
      <InputText value={inputValue} name="code" placeholder={mfaView.otp_placeholder}
        onChange={setInputValue} autoFocus
      />
      <SecurityButton value='Validate'>{gettext('Validate')}</SecurityButton>
    </>}
    {error && <NotifierMessage message={error} type={MESSAGE_TYPE.ERROR} closable={false} />}
    {!sentMessage &&
    <SecurityButton type="button" name="send_code" onClick={sendCodeToPhone} disabled={sending}>
      {sending ? mfaView.button_label_sending : mfaView.button_label}
    </SecurityButton>}
  </>;
}

SMSValidateView.propTypes = {
  mfaView: PropTypes.object,
  sendSmsUrl: PropTypes.string,
  csrfHeader: PropTypes.string,
  csrfToken: PropTypes.string
};

export default function MfaValidatePage({actionUrl, views, logoutUrl, sendEmailUrl, sendSmsUrl, csrfHeader, csrfToken, ...props}) {
  // Log all props to help with debugging
  console.log('MfaValidatePage props:', {
    actionUrl,
    views: Object.keys(views),
    logoutUrl,
    sendEmailUrl,
    sendSmsUrl,
    csrfHeader,
    csrfToken
  });
  
  // Create a dedicated renderSMSView function similar to what was done for MfaRegisterPage
  const renderSMSView = () => {
    // If the SMS view isn't available or is missing properties, create a complete one
    if (!views.sms || !views.sms.view) {
      console.log('SMS view not available, creating a default one');
      return null;
    }
    
    // Create an enhanced view with all necessary properties
    const enhancedView = {
      ...views.sms.view,
      description: views.sms.view.description || 'Verify with SMS Authentication',
      button_label: views.sms.view.button_label || 'Send Code',
      button_label_sending: views.sms.view.button_label_sending || 'Sending Code...',
      otp_placeholder: views.sms.view.otp_placeholder || 'Enter verification code'
    };
    
    console.log('Enhanced SMS view:', enhancedView);
    
    return <SMSValidateView 
      mfaView={enhancedView} 
      csrfHeader={csrfHeader} 
      csrfToken={csrfToken} 
    />;
  };
  
  const [method, setMethod] = useState(Object.values(views).find((v)=>v.selected)?.id);
  return (
    <BasePage title={gettext('Authentication')} pageImage={<LoginImage style={{height: '100%', width: '100%'}} />} {...props}>
      <form style={{display:'flex', gap:'15px', flexDirection:'column', minHeight: 0}} action={actionUrl} method="POST">
        <InputSelect value={method} options={Object.keys(views).map((k)=>({
          label: views[k].label,
          value: views[k].id,
          imageUrl: views[k].icon
        }))} onChange={setMethod} controlProps={{
          allowClear: false,
        }} />
        <div><input type='hidden' name='mfa_method' defaultValue={method} /></div>
        {method == 'email' && <EmailValidateView mfaView={views[method].view} sendEmailUrl={sendEmailUrl} csrfHeader={csrfHeader} csrfToken={csrfToken} />}
        {method == 'authenticator' && <AuthenticatorValidateView mfaView={views[method].view} />}
        {method == 'sms' && renderSMSView()}
        <div style={{textAlign: 'right'}}>
          <a style={{color:'inherit'}} href={logoutUrl}>{gettext('Logout')}</a>
        </div>
      </form>
    </BasePage>
  );
}

MfaValidatePage.propTypes = {
  actionUrl: PropTypes.string,
  views: PropTypes.object,
  logoutUrl: PropTypes.string,
  sendEmailUrl: PropTypes.string,
  csrfHeader: PropTypes.string,
  csrfToken: PropTypes.string
};
