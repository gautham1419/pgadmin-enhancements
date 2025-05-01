"""
Simple Twilio SMS Test Script

This standalone script tests the Twilio API integration without requiring
the pgAdmin testing framework. It directly tests sending an SMS message
using your Twilio credentials.

Usage:
    python simple_twilio_test.py [phone_number]
"""

import os
import sys
import random
import string
import argparse
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def test_twilio_sms(phone_number='+919567283578', account_sid=None, auth_token=None, from_number=None):
    """Test sending SMS via Twilio API"""
    
    # Get credentials from environment variables if not provided
    account_sid = account_sid or os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = auth_token or os.environ.get('TWILIO_AUTH_TOKEN')
    from_number = from_number or os.environ.get('TWILIO_FROM_NUMBER')
    
    # Check if Twilio credentials are configured
    if not account_sid:
        print("Error: TWILIO_ACCOUNT_SID not provided")
        return False
        
    if not auth_token:
        print("Error: TWILIO_AUTH_TOKEN not provided")
        return False
        
    if not from_number:
        print("Error: TWILIO_FROM_NUMBER not provided")
        return False
    
    # Print configuration status (without exposing actual credentials)
    print(f"Twilio configuration:")
    print(f"  - Account SID: {'Configured' if account_sid else 'Not configured'}")
    print(f"  - Auth Token: {'Configured' if auth_token else 'Not configured'}")
    print(f"  - Phone Number: {from_number}")
    
    # Generate OTP
    otp = generate_otp()
    print(f"Generated OTP: {otp}")
    
    try:
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Send SMS
        print(f"Sending SMS to {phone_number}...")
        message = client.messages.create(
            body=f"Your pgAdmin verification code is: {otp}",
            from_=from_number,
            to=phone_number
        )
        
        # Print success message
        print(f"SMS sent successfully!")
        print(f"Message SID: {message.sid}")
        return True
        
    except TwilioRestException as e:
        print(f"Twilio API Error: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

def mock_test_twilio_sms(phone_number='+919567283578'):
    """Test the SMS sending logic without making actual API calls"""
    print("Running mock Twilio test (no actual SMS will be sent)")
    
    # Use mock values for testing
    account_sid = 'mock_account_sid'
    auth_token = 'mock_auth_token'
    from_number = '+1987654321'
    
    # Print configuration status
    print(f"Twilio configuration (mock values):")
    print(f"  - Account SID: Configured (mock)")
    print(f"  - Auth Token: Configured (mock)")
    print(f"  - Phone Number: {from_number}")
    
    # Generate OTP
    otp = generate_otp()
    print(f"Generated OTP: {otp}")
    
    # Simulate SMS sending
    print(f"Simulating SMS to {phone_number}...")
    print(f"SMS content: Your pgAdmin verification code is: {otp}")
    print(f"Mock SMS sent successfully!")
    print(f"Mock Message SID: mock_{otp}")
    
    return True

def verify_otp(generated_otp):
    """Verify the OTP entered by the user"""
    user_otp = input("\nEnter the OTP you received on your phone: ")
    if user_otp == generated_otp:
        print("\n✅ OTP verification successful!")
        return True
    else:
        print("\n❌ OTP verification failed! The OTPs don't match.")
        return False

if __name__ == '__main__':
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Test Twilio SMS functionality')
    parser.add_argument('phone_number', nargs='?', default='+919567283578', help='Phone number to send SMS to')
    parser.add_argument('--mock', action='store_true', help='Run in mock mode without sending actual SMS')
    parser.add_argument('--account-sid', help='Twilio Account SID')
    parser.add_argument('--auth-token', help='Twilio Auth Token')
    parser.add_argument('--from-number', help='Twilio Phone Number to send from')
    parser.add_argument('--verify', action='store_true', help='Verify the OTP after sending')
    
    args = parser.parse_args()
    
    print("=== Twilio SMS Test ===")
    print(f"Testing with phone number: {args.phone_number}")
    print(f"Mock mode: {'Enabled' if args.mock else 'Disabled'}")
    
    # Store the generated OTP
    generated_otp = None
    
    if args.mock:
        success = mock_test_twilio_sms(args.phone_number)
        # In mock mode, we know the OTP
        generated_otp = generate_otp()
    else:
        # When sending a real SMS, we need to capture the OTP
        # Get credentials from environment variables if not provided
        account_sid = args.account_sid or os.environ.get('TWILIO_ACCOUNT_SID')
        auth_token = args.auth_token or os.environ.get('TWILIO_AUTH_TOKEN')
        from_number = args.from_number or os.environ.get('TWILIO_FROM_NUMBER')
        
        # Generate OTP
        generated_otp = generate_otp()
        print(f"Generated OTP: {generated_otp}")
        
        try:
            # Initialize Twilio client
            client = Client(account_sid, auth_token)
            
            # Send SMS
            print(f"Sending SMS to {args.phone_number}...")
            message = client.messages.create(
                body=f"Your pgAdmin verification code is: {generated_otp}",
                from_=from_number,
                to=args.phone_number
            )
            
            # Print success message
            print(f"SMS sent successfully!")
            print(f"Message SID: {message.sid}")
            success = True
            
        except Exception as e:
            print(f"Error: {e}")
            success = False
    
    if success:
        print("\n✅ Test completed successfully!")
        
        # Verify OTP if requested
        if args.verify and generated_otp:
            verify_otp(generated_otp)
    else:
        print("\n❌ Test failed!")
        
    # If not explicitly asked to verify, but we have an OTP, offer verification
    if not args.verify and success and generated_otp:
        verify_now = input("\nDo you want to verify the OTP now? (y/n): ").lower() == 'y'
        if verify_now:
            verify_otp(generated_otp)
