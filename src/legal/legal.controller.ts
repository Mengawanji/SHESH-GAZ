import { Controller, Get, Header } from '@nestjs/common';

@Controller()
export class LegalController {
  @Get('privacy')
  @Header('Content-Type', 'text/html; charset=utf-8')
  privacy() {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Privacy Policy</title></head>
    <body style="font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 16px">
    <h1>Privacy Policy</h1>
    <p> ("we") uses WhatsApp to answer customer questions and take orders.</p>
    <p><b>Data we collect:</b> your WhatsApp phone number, your name as shown on WhatsApp, and the messages you send us.</p>
    <p><b>How we use it:</b> only to reply to you and process your orders. We do not sell or share your data with third parties, except the service providers needed to operate the service (such as Meta/WhatsApp and our hosting provider).</p>
    <p><b>Retention and deletion:</b> to request deletion of your data, email support@sheshgaz.com and we will delete it.</p>
    <p><b>Contact:</b> support@sheshgaz.com</p>
    </body></html>`;
    }

    @Get('data-deletion')
    @Header('Content-Type', 'text/html; charset=utf-8')
    dataDeletion() {
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Data Deletion</title></head>
    <body style="font-family:sans-serif;max-width:700px;margin:40px auto;padding:0 16px">
    <h1>Data Deletion Instructions</h1>
    <p>To delete your data, email support@sheshgaz.com from the address or mention the phone number you used on WhatsApp. We will delete your data within 30 days.</p>
    </body></html>`;
  }
}