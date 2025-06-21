import requests
import os

MAILGUN_API_KEY = os.environ.get('MAILGUN_API_KEY')
MAILGUN_DOMAIN = os.environ.get('MAILGUN_DOMAIN')
DEVELOPER_EMAIL = 'rediskaSgryadki@yandex.ru'


def send_feedback_email(user_email, message):
    if not MAILGUN_API_KEY or not MAILGUN_DOMAIN:
        return False
    subject = 'Новое сообщение обратной связи'
    text = f"Email пользователя: {user_email or 'не указан'}\n\nСообщение:\n{message}"
    return requests.post(
        f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages",
        auth=("api", MAILGUN_API_KEY),
        data={
            "from": f"Feedback <mailgun@{MAILGUN_DOMAIN}>",
            "to": [DEVELOPER_EMAIL],
            "subject": subject,
            "text": text,
        },
        timeout=10
    ).ok 