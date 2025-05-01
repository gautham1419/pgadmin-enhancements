/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2025, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////
import { Box } from '@mui/material';
import React, { useState } from 'react';
import LoginImage from '../../img/login.svg?svgr';
import { FormNote, InputText } from '../components/FormComponents';
import BasePage, { SecurityButton } from './BasePage';
import { DefaultButton } from '../components/Buttons';
import gettext from 'sources/gettext';
import PropTypes from 'prop-types';

function EmailRegisterView({mfaView}) {
  const [inputEmail, setInputEmail] = useState(mfaView.email_address);
  const [inputCode, setInputCode] = useState('');

  if(mfaView.email_address_placeholder) {
    return <>
      <div style={{textAlign: 'center', fontSize: '1.2em'}} data-test="email-register-view">{mfaView.label}</div>
      <div>
        <input type='hidden' name={mfaView.auth_method} value='SETUP'/>
        <input type='hidden' name='validate' value='send_code'/>
      </div>
      <div>{mfaView.description}</div>
      <InputText value={inputEmail} type="email" name="send_to" placeholder={mfaView.email_address_placeholder}
        onChange={setInputEmail} required
      />
      <FormNote text={mfaView.note} />
    </>;
  } else if(mfaView.otp_placeholder) {
    return <>
      <div style={{textAlign: 'center', fontSize: '1.2em'}} data-test="email-register-view">{mfaView.label}</div>
      <div>
        <input type='hidden' name={mfaView.auth_method} value='SETUP'/>
        <input type='hidden' name='validate' value='verify_code'/>
      </div>
      <div>{mfaView.message}</div>
      <InputText value={inputCode} pattern="\d{6}" type="password" name="code" placeholder={mfaView.otp_placeholder}
        onChange={setInputCode} required autoComplete="one-time-code"
      />
    </>;
  }
}

EmailRegisterView.propTypes = {
  mfaView: PropTypes.object,
};

function AuthenticatorRegisterView({mfaView}) {
  const [inputValue, setInputValue] = useState(mfaView.email_address);

  return <>
    <div style={{textAlign: 'center', fontSize: '1.2em'}} data-test="auth-register-view">{mfaView.auth_title}</div>
    <div>
      <input type='hidden' name={mfaView.auth_method} value='SETUP'/>
      <input type='hidden' name='VALIDATE' value='validate'/>
    </div>
    <div style={{minHeight: 0, display: 'flex'}}>
      <img src={`data:image/jpeg;base64,${mfaView.image}`} style={{maxWidth: '100%', objectFit: 'contain'}} alt={mfaView.qrcode_alt_text} />
    </div>
    <div>{mfaView.auth_description}</div>
    <InputText value={inputValue} type="password" name="code" placeholder={mfaView.otp_placeholder}
      onChange={setInputValue}
    />
  </>;
}

AuthenticatorRegisterView.propTypes = {
  mfaView: PropTypes.object,
};

function SMSRegisterView({mfaView}) {
  // Use semantically appropriate property names for SMS authentication
  const [inputPhone, setInputPhone] = useState(mfaView.phone_number || mfaView.email_address || '');
  const [inputCode, setInputCode] = useState('');

  console.log('SMS Register View mfaView:', mfaView);
  
  // Force display the phone input form if verification code hasn't been sent yet
  // This ensures the form always shows regardless of property names
  if(!mfaView.verification_code_sent && !mfaView.otp_placeholder) {
    return <>
      <div style={{textAlign: 'center', fontSize: '1.2em'}} data-test="sms-register-view">
        {mfaView.label || 'SMS Authentication'}
      </div>
      <div>
        <input type='hidden' name={mfaView.auth_method} value='SETUP'/>
        <input type='hidden' name='validate' value='send_code'/>
      </div>
      <div>{mfaView.description || 'Enter your phone number to receive a verification code'}</div>
      <InputText 
        value={inputPhone} 
        type="tel" 
        name="send_to" 
        placeholder={mfaView.phone_number_placeholder || mfaView.email_address_placeholder || 'Phone number (with country code)'}
        onChange={setInputPhone} 
        required
      />
      <FormNote text={mfaView.note || 'This phone number will only be used for two factor authentication purposes. Include country code (e.g., +1 for US).'} />
    </>;
  } else if(mfaView.otp_placeholder) {
    return <>
      <div style={{textAlign: 'center', fontSize: '1.2em'}} data-test="sms-register-view">{mfaView.label}</div>
      <div>
        <input type='hidden' name={mfaView.auth_method} value='SETUP'/>
        <input type='hidden' name='validate' value='verify_code'/>
      </div>
      <div>{mfaView.message}</div>
      <InputText value={inputCode} pattern="\d{6}" type="password" name="code" placeholder={mfaView.otp_placeholder}
        onChange={setInputCode} required autoComplete="one-time-code"
      />
    </>;
  }
}

SMSRegisterView.propTypes = {
  mfaView: PropTypes.object,
};

export default function MfaRegisterPage({actionUrl, mfaList, nextUrl, mfaView, ...props}) {
  console.log('MfaRegisterPage mfaList:', mfaList);
  console.log('MfaRegisterPage mfaView:', mfaView);
  
  // Debug which component will be rendered
  if (mfaView) {
    console.log('Will render component for auth_method:', mfaView.auth_method);
    if (mfaView.auth_method === 'sms') {
      console.log('SMS properties available:', Object.keys(mfaView));
      
      // Ensure SMS view has all required properties for both directions
      if (!mfaView.hasOwnProperty('email_address_placeholder') && mfaView.hasOwnProperty('phone_number_placeholder')) {
        console.log('Adding backward-compatible properties to SMS view');
        mfaView.email_address_placeholder = mfaView.phone_number_placeholder;
        mfaView.email_address = mfaView.phone_number || '';
      }
      
      if (!mfaView.hasOwnProperty('phone_number_placeholder') && mfaView.hasOwnProperty('email_address_placeholder')) {
        console.log('Adding semantically appropriate properties to SMS view');
        mfaView.phone_number_placeholder = mfaView.email_address_placeholder;
        mfaView.phone_number = mfaView.email_address || '';
      }
    }
  } else {
    console.log('Will render MFA list');
  }
  // Force SMS view to display if it's the SMS auth method
  const renderSMSView = () => {
    // Create a minimal mfaView object if needed
    const smsView = {
      label: 'SMS Authentication',
      auth_method: 'sms',
      description: 'Enter your phone number to receive a verification code',
      phone_number_placeholder: 'Phone number (with country code)',
      phone_number: '',
      email_address_placeholder: 'Phone number (with country code)',
      email_address: '',
      note_label: 'Note',
      note: 'This phone number will only be used for two factor authentication purposes. Include country code (e.g., +1 for US).'
    };
    
    // If mfaView exists but is missing required properties, add them
    const enhancedMfaView = mfaView ? {
      ...mfaView,
      // Ensure backward compatibility
      email_address_placeholder: mfaView.email_address_placeholder || mfaView.phone_number_placeholder || 'Phone number (with country code)',
      email_address: mfaView.email_address || mfaView.phone_number || '',
      // Ensure semantically appropriate names
      phone_number_placeholder: mfaView.phone_number_placeholder || mfaView.email_address_placeholder || 'Phone number (with country code)',
      phone_number: mfaView.phone_number || mfaView.email_address || ''
    } : smsView;
    
    return <SMSRegisterView mfaView={enhancedMfaView} />;
  };
  
  return (
    <BasePage title={gettext('Authentication Registration')} pageImage={<LoginImage style={{height: '100%', width: '100%'}} />} {...props}>
      <form style={{display:'flex', gap:'15px', flexDirection:'column', minHeight: 0}} action={actionUrl} method="POST">
        {mfaView ? <>
          {mfaView.auth_method == 'email' && <EmailRegisterView mfaView={mfaView} />}
          {mfaView.auth_method == 'authenticator' && <AuthenticatorRegisterView mfaView={mfaView} />}
          {mfaView.auth_method == 'sms' && renderSMSView()}
          <Box display="flex" gap="15px">
            <SecurityButton name="continue" value="Continue">{gettext('Continue')}</SecurityButton>
            <DefaultButton type="submit" name="cancel" value="Cancel" style={{width: '100%'}}>{gettext('Cancel')}</DefaultButton>
          </Box>
        </>:<>
          {mfaList?.map((m)=>{
            return (
              <Box display="flex" width="100%" key={m.label}>
                <div style={{
                  width: '10%', mask: `url(${m.icon})`, maskRepeat: 'no-repeat',
                  WebkitMask: `url(${m.icon})`, WebkitMaskRepeat: 'no-repeat',
                  backgroundColor: '#fff'
                }}>
                </div>
                <div style={{width: '70%'}}>{m.label}</div>
                <div style={{width: '20%'}}>
                  <SecurityButton name={m.id} value={m.registered ? 'DELETE' : 'SETUP'}>{m.registered ? gettext('Delete') : gettext('Setup')}</SecurityButton>
                </div>
              </Box>
            );
          })}
          {nextUrl != 'internal' && <SecurityButton value="Continue">{gettext('Continue')}</SecurityButton>}
        </>}
        <div><input type="hidden" name="next" value={nextUrl}/></div>
      </form>
    </BasePage>
  );
}

MfaRegisterPage.propTypes = {
  actionUrl: PropTypes.string,
  mfaList: PropTypes.arrayOf(PropTypes.object),
  nextUrl: PropTypes.string,
  mfaView: PropTypes.object
};
