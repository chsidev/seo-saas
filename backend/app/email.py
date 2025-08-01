import os
import httpx

def send_verification_email(to_email: str, token: str):
    domain = os.getenv("MAILGUN_DOMAIN")
    api_key = os.getenv("MAILGUN_API_KEY")
    sender = os.getenv("MAILGUN_SENDER")
    frontend_url = os.getenv("BASE_URL", "http://localhost:3000")
    print("domain: ", domain)

    verification_link = f"{frontend_url}/auth/verify-email?token={token}"
    print("verification_link : ", verification_link)

    # return httpx.post(
    #     f"https://api.mailgun.net/v3/{domain}/messages",
    #     auth=("api", api_key),
    #     data={
    #         "from": f"SEO Tool <{sender}>",
    #         "to": [to_email],
    #         "subject": "Verify your email",
    #         "text": f"Click to verify your email: {verification_link}"
    #     },
    # )
    response = httpx.post(
        f"https://api.mailgun.net/v3/{domain}/messages",
        auth=("api", api_key),
        data={
            "from": f"SEO Tool <{sender}>",
            "to": [to_email],
            "subject": "Verify your email",
            "text": f"Click to verify your email: {verification_link}"
        },
    )

    print(" Mailgun response:", response.status_code, response.text)
    return response

def send_team_invite_email(to_email: str, token: str, project_name: str):
    domain = os.getenv("MAILGUN_DOMAIN")
    api_key = os.getenv("MAILGUN_API_KEY")
    sender = os.getenv("MAILGUN_SENDER")
    frontend_url = os.getenv("BASE_URL", "http://localhost:3000")

    invite_link = f"{frontend_url}/auth/accept-invite?token={token}"
    print("invite_link: ", invite_link)

    response = httpx.post(
        f"https://api.mailgun.net/v3/{domain}/messages",
        auth=("api", api_key),
        data={
            "from": f"SEO Tool <{sender}>",
            "to": [to_email],
            "subject": f"You've been invited to join '{project_name}'",
            "text": f"You've been invited to collaborate on the project '{project_name}'.\n\n"
                    f"Click the link to accept your invitation:\n\n{invite_link}\n\n"
                    f"If you don’t recognize this project, you can ignore this email."
        },
    )
    return response