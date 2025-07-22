
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';
import { Ticket } from '../../modules/tickets/models/Ticket.entity';
import { Events } from '../../modules/events/entity/Events.entity';
import { timeStamp } from 'console';
import { Subject } from 'typeorm/persistence/Subject';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.email', 
    port: parseInt(process.env.EMAIL_PORT || '587', 10), 
    secure: process.env.EMAIL_SECURE === 'true', 
    auth: {
        user: process.env.EMAIL_USER , 
        pass: process.env.EMAIL_PASS 
    },
});

export class EmailService{
  private async generateQrCodeBuffer(data: string): Promise<Buffer>{
    try{
        const qrCodeBuffer = await QRCode.toBuffer(data, {
            errorCorrectionLevel: 'H',
            width: 250,
            margin: 1,
            type: 'png'
        })
        return qrCodeBuffer;
    }catch(error){
        console.error('Error generation QR code:', error)
        throw new Error('Failed to generate QR code Buffer.')
    }
  }

  async sendTicketConfirmationEmail(userEmail: string, ticket: Ticket, event: Events): Promise<void>{
    const qrCodeContent = JSON.stringify({
        ticketId: ticket.id,
        userEmail: userEmail,
        eventId: event.id,
        timeStamp: new Date().toISOString()
    });

    const qrCodeBuffer = await this.generateQrCodeBuffer(qrCodeContent);
    const qrCodeCid = `qrcode_${ticket.id}@eventapp.com`; // Unique ID for this image


    const mailOptions ={
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Your Ticket for ${event.title} - Ticket ID: ${ticket.id}`,
         html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Hello!</h2>
                    <p>Thank you for booking your ticket for <strong>${event.title}</strong>!</p>
                    <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                    <p><strong>Event:</strong> ${event.title}</p>
                    <p><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()} - ${new Date(event.endDate).toLocaleTimeString()}</p>
                    <p><strong>Price:</strong> $${Number(ticket.totalPrice).toFixed(2)}</p>
                    <p>Please present the QR code below at the event entry point for scanning.</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <img src="${qrCodeCid}" alt="QR Code for Ticket ID ${ticket.id}" style="max-width: 100%; height: auto; border: 1px solid #ddd; padding: 5px;"/>
                    </div>
                    <p>We look forward to seeing you there!</p>
                    <p>Best regards,<br/>The Event Team</p>
                    <hr style="border: none; border-top: 1px solid #eee;"/>
                    <p style="font-size: 0.8em; color: #777;">This is an automated email, please do not reply.</p>
                </div>
            `, 
            attachments: [
                {
                    filename: `ticket_qr_${ticket.id}.png`, // Name of the attachment
                    content: qrCodeBuffer, // The QR code image data
                    contentType: 'image/png', // MIME type
                    cid: qrCodeCid, // This MUST match the cid: in the img src
                },
            ],
            
        };
         try {
            await transporter.sendMail(mailOptions);
            console.log(`Ticket confirmation email sent to ${userEmail} for Ticket ID: ${ticket.id}`);
        } catch (error) {
            console.error(`Failed to send ticket confirmation email to ${userEmail} for Ticket ID ${ticket.id}:`, error);
        }
    }

  }
