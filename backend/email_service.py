import requests
import os

def send_email_via_api(to_email, subject, html_content):
    """Send email using brevo (formerly sendinblue) Web API instead of SMTP"""

    api_key = os.environ.get("BREVO_API_KEY")
    sender_email = os.environ.get("EMAIL_USER")

    if not api_key or not sender_email:
        raise Exception("Brevo API key or sender email not configured")

    url = "https://api.brevo.com/v3/smtp/email"

    headers = {
        "accept": "application/json",
        "api-key": f"{api_key}",
        "content-type": "application/json",
    }

    data = {
        "sender": {"name": "Venuo", "email": sender_email},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content
    }

    response = requests.post(url, headers=headers, json=data)

    print(f"Email API Response: {response.status_code}")
    valid_responses = [200, 201, 202]
    if response.status_code not in valid_responses:
        raise Exception(f"Failed to send email: {response.status_code}, {response.text}")
    
    return True

