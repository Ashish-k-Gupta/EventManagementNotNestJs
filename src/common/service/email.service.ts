
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';
import { Ticket } from '../../modules/tickets/models/Ticket.entity';
import { Events } from '../../modules/events/entity/Events.entity';
import { Users } from '../../modules/users/models/Users.entity';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.email',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

export class EmailService {
    private async generateQrCodeBuffer(data: string): Promise<Buffer> {
        try {
            const qrCodeBuffer = await QRCode.toBuffer(data, {
                errorCorrectionLevel: 'H',
                width: 250,
                margin: 1,
                type: 'png'
            })
            return qrCodeBuffer;
        } catch (error) {
            console.error('Error generation QR code:', error)
            throw new Error('Failed to generate QR code Buffer.')
        }
    }

    async sendTicketConfirmationEmail(userEmail: string, ticket: Ticket, event: Events): Promise<void> {
        const qrCodeContent = JSON.stringify({
            ticketId: ticket.id,
            ticketIsCancelled: ticket.isCancelled,
            userEmail: userEmail,
            eventId: event.id,
            timeStamp: new Date().toISOString()
        });

        const qrCodeBuffer = await this.generateQrCodeBuffer(qrCodeContent);
        const qrCodeCid = `qrcode_${ticket.id}@eventapp.com`;


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Your Ticket for ${event.title} - Ticket ID: ${ticket.id}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background-color: #4CAF50; padding: 20px; text-align: center; color: #ffffff;">
                                            <h1 style="margin: 0; font-size: 28px;">Your Event Ticket!</h1>
                                        </td>
                                    </tr>
                                    <!-- Body Content -->
                                    <tr>
                                        <td style="padding: 30px;">
                                            <h2 style="color: #4CAF50; margin-top: 0;">Hello!</h2>
                                            <p style="font-size: 16px;">Thank you for booking your ticket for <strong>${event.title}</strong>!</p>
                                            
                                            <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
                                                <h3 style="color: #555; margin-top: 0; font-size: 20px;">Event Details:</h3>
                                                <p style="margin: 5px 0;"><strong>Event Name:</strong> <span style="color: #4CAF50; font-weight: bold;">${event.title}</span></p>
                                                <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticket.id}</p>
                                                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
                                                <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()} - ${new Date(event.endDate).toLocaleTimeString()}</p>
                                                <p style="margin: 5px 0;"><strong>Price:</strong> $${Number(ticket.totalPrice).toFixed(2)}</p>
                                            </div>

                                            <p style="font-size: 16px;">Please present the QR code below at the event entry point for scanning.</p>
                                            <div style="text-align: center; margin: 30px 0;">
                                                <!-- Reference the QR code using its Content-ID (cid:) -->
                                                <img src="cid:${qrCodeCid}" alt="QR Code for Ticket ID ${ticket.id}" style="max-width: 250px; height: auto; border: 5px solid #4CAF50; padding: 5px; border-radius: 8px;"/>
                                            </div>
                                            <p style="font-size: 16px;">We look forward to seeing you there!</p>
                                            <p style="font-size: 16px;">Best regards,<br/>The Event Team</p>
                                        </td>
                                    </tr>
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #777;">
                                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Event Booking System. All rights reserved.</p>
                                            <p style="margin: 5px 0 0;">This is an automated email, please do not reply.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            `,
            attachments: [
                {
                    filename: `ticket_qr_${ticket.id}.png`,
                    content: qrCodeBuffer,
                    contentType: 'image/png',
                    cid: qrCodeCid,
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


    async sendTicketCancelEmail(userEmail: string, ticket: Ticket, event: Events): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Cancelled Your Ticket for ${event.title} - Ticket ID: ${ticket.id}`,
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background-color: #DC3545; padding: 20px; text-align: center; color: #ffffff;">
                                            <h1 style="margin: 0; font-size: 28px;">Ticket Cancellation Confirmed</h1>
                                        </td>
                                    </tr>
                                    <!-- Body Content -->
                                    <tr>
                                        <td style="padding: 30px;">
                                            <h2 style="color: #DC3545; margin-top: 0;">Hello!</h2>
                                            <p style="font-size: 16px;">This email confirms that your ticket for <strong>${event.title}</strong> has been successfully <strong>cancelled</strong>.</p>
                                            
                                            <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
                                                <h3 style="color: #555; margin-top: 0; font-size: 20px;">Cancellation Details:</h3>
                                                <p style="margin: 5px 0;"><strong>Event Name:</strong> <span style="color: #DC3545; font-weight: bold;">${event.title}</span></p>
                                                <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticket.id}</p>
                                                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
                                                <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()} - ${new Date(event.endDate).toLocaleTimeString()}</p>
                                                <p style="margin: 5px 0;"><strong>Price:</strong> $${Number(ticket.totalPrice).toFixed(2)}</p>
                                            </div>

                                            <p style="font-size: 16px;">If you have any questions, please contact our support team.</p>
                                            <p style="font-size: 16px;">Best regards,<br/>The Event Team</p>
                                        </td>
                                    </tr>
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #777;">
                                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Event Booking System. All rights reserved.</p>
                                            <p style="margin: 5px 0 0;">This is an automated email, please do not reply.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </tabl
        `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Ticket Cancellation email sent to ${userEmail} for Ticket ID: ${ticket.id}`);
        } catch (error) {
            console.error(`Failed to send ticket cancellation email to ${userEmail} for Ticket ID ${ticket.id}:`, error);
        }

    }

    async newRegistrationAlert(organizerId: string, ticket: Ticket, event: Events, attendeeUser: Users) {
        const mailOptions = {
            from: process.env.EMAIL_UESER,
            to: event.user.email,
            subject: `You've Got a New Attendee for ${event.title} - Ticket ID: ${ticket.id}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background-color: #007BFF; padding: 20px; text-align: center; color: #ffffff;">
                                            <h1 style="margin: 0; font-size: 28px;">New Attendee Alert!</h1>
                                        </td>
                                    </tr>
                                    <!-- Body Content -->
                                    <tr>
                                        <td style="padding: 30px;">
                                            <h2 style="color: #007BFF; margin-top: 0;">Hello Organizer!</h2>
                                            <p style="font-size: 16px;">A new ticket has been booked for your event <strong>${event.title}</strong>!</p>
                                            
                                            <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
                                                <h3 style="color: #555; margin-top: 0; font-size: 20px;">Booking Details:</h3>
                                                <p style="margin: 5px 0;"><strong>Event Name:</strong> <span style="color: #007BFF; font-weight: bold;">${event.title}</span></p>
                                                <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticket.id}</p>
                                                <p style="margin: 5px 0;"><strong>Attendee Name:</strong> ${attendeeUser.firstName} ${attendeeUser.lastName}</p>
                                                <p style="margin: 5px 0;"><strong>Attendee Email:</strong> ${attendeeUser.email || 'N/A'}</p>
                                                <p style="margin: 5px 0;"><strong>Booking Date:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                                                <p style="margin: 5px 0;"><strong>Ticket Price:</strong> $${Number(ticket.totalPrice).toFixed(2)}</p>
                                                <p style="margin: 5px 0;"><strong>Tickets Left:</strong> ${event.availableSeats}</p>

                                            </div>

                                            <p style="font-size: 16px;">Keep track of your attendees and prepare for a great event!</p>
                                            <p style="font-size: 16px;">Best regards,<br/>The Event Team</p>
                                        </td>
                                    </tr>
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #777;">
                                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Event Booking System. All rights reserved.</p>
                                            <p style="margin: 5px 0 0;">This is an automated email, please do not reply.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
        `
        }

        try {
            await transporter.sendMail(mailOptions);
            console.log(`New ticket booking email sent to ${event.user.email} for Ticket ID: ${ticket.id}`);
        } catch (error) {
            console.error(`Failed to send new ticket booking email to ${event.user.email} for Ticket ID: ${ticket.id}`, error);
        }

    }

    async ticketCancellationAlert(organizerEmail: string, ticket: Ticket, event: Events, attendeeUser: Users): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Event Booking System" <no-reply@yourdomain.com>',
            to: organizerEmail,
            subject: `Ticket Cancellation Alert for ${event.title} - Ticket ID: ${ticket.id}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background-color: #FFC107; padding: 20px; text-align: center; color: #333;">
                                            <h1 style="margin: 0; font-size: 28px;">Ticket Cancellation Alert!</h1>
                                        </td>
                                    </tr>
                                    <!-- Body Content -->
                                    <tr>
                                        <td style="padding: 30px;">
                                            <h2 style="color: #FFC107; margin-top: 0;">Hello Organizer!</h2>
                                            <p style="font-size: 16px;">A ticket for your event <strong>${event.title}</strong> has been <strong>cancelled</strong>.</p>
                                            
                                            <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
                                                <h3 style="color: #555; margin-top: 0; font-size: 20px;">Cancellation Details:</h3>
                                                <p style="margin: 5px 0;"><strong>Event Name:</strong> <span style="color: #FFC107; font-weight: bold;">${event.title}</span></p>
                                                <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticket.id}</p>
                                                <p style="margin: 5px 0;"><strong>Attendee Name:</strong> ${attendeeUser.firstName || ''} ${attendeeUser.lastName || ''}</p>
                                                <p style="margin: 5px 0;"><strong>Attendee Email:</strong> ${attendeeUser.email || 'N/A'}</p>
                                                <p style="margin: 5px 0;"><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                                                <p style="margin: 5px 0;"><strong>Ticket Price:</strong> $${Number(ticket.totalPrice).toFixed(2)}</p>
                                                <p style="margin: 5px 0;"><strong>Tickets Left:</strong> ${event.availableSeats}</p>
                                            </div>

                                            <p style="font-size: 16px;">The seat for this ticket has been re-added to your event's available capacity.</p>
                                            <p style="font-size: 16px;">Best regards,<br/>The Event Team</p>
                                        </td>
                                    </tr>
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #777;">
                                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Event Booking System. All rights reserved.</p>
                                            <p style="margin: 5px 0 0;">This is an automated email, please do not reply.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`Ticket cancellation alert email sent to ${organizerEmail} for Ticket ID: ${ticket.id}`);
        } catch (error) {
            console.error(`Failed to send ticket cancellation alert email to ${organizerEmail} for Ticket ID: ${ticket.id}`, error);
        }
    }

    async resetPasswordRequest(resetPasswordEmail: string, resetUrl: string): Promise<void> {


        const mailOptions = {
            from: 'noreply@your-application.com', // Your application's sender email
            to: resetPasswordEmail,
            subject: 'Password Reset Request for Your Account',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #0056b3;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You have requested to reset the password for your account.</p>
                    <p>Please click on the link below to reset your password:</p>
                    <p style="margin: 20px 0;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
                    </p>
                    <p>This link is valid for a limited time (e.g., 1 hour). If you did not request a password reset, please ignore this email.</p>
                    <p>Thank you,<br>Your Application Team</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p style="font-size: 0.8em; color: #666;">If the button above does not work, copy and paste the following URL into your browser:</p>
                    <p style="font-size: 0.8em; color: #666; word-break: break-all;">${resetUrl}</p>
                </div>
                `
        }

         try {
            await transporter.sendMail(mailOptions);
            console.log(`Password reset email sent to ${resetPasswordEmail}`);
        } catch (error) {
            console.error(`Failed to send password reset email to ${resetPasswordEmail}`, error);
            throw new Error(`Failed to send password reset email: ${error}`);
        }
    }

}
