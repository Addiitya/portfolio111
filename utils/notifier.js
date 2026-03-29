const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'adityakolhe168@gmail.com',
    pass: process.env.EMAIL_PASS || ''
  }
});

const sendBookingConfirmationEmail = async (booking) => {
  try {
    const html = `
      <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #f5f5f5; padding: 2rem; border-radius: 12px; border: 1px solid #151515;">
        <h1 style="color: #e60000; font-size: 1.5rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px;">Booking Confirmed</h1>
        <p style="font-size: 1.1rem; line-height: 1.6; color: #e0e0e0;">Hi ${booking.name},</p>
        <p style="font-size: 1rem; line-height: 1.6; color: #aaa;">Your project request for a <strong>${booking.eventType}</strong> on <strong>${new Date(booking.date).toLocaleDateString()}</strong> has been officially confirmed by _eyeadi Visuals.</p>
        <p style="font-size: 1rem; line-height: 1.6; color: #aaa;">We will be in touch shortly to discuss the creative direction and finalizing details.</p>
        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #333; font-size: 0.85rem; color: #666;">
          <p style="margin: 0;">— Aditya Kolhe</p>
          <p style="margin: 0; color: #e60000; font-weight: bold;">_EYEADI VISUALS</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"_eyeadi Visuals" <${process.env.EMAIL_USER || 'adityakolhe168@gmail.com'}>`,
      to: booking.email,
      subject: `Booking Confirmed: ${booking.eventType} with _eyeadi Visuals`,
      html: html
    });
    console.log(`✅ Confirmation email sent to ${booking.email}`);
  } catch (err) {
    console.error(`⚠️ Failed to send confirmation email: ${err.message}`);
  }
};

const sendContactReplyEmail = async (contact) => {
  try {
    const html = `
      <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: #f5f5f5; padding: 2rem; border-radius: 12px; border: 1px solid #151515;">
        <h1 style="color: #e60000; font-size: 1.5rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px;">Inquiry Received</h1>
        <p style="font-size: 1.1rem; line-height: 1.6; color: #e0e0e0;">Hi ${contact.name},</p>
        <p style="font-size: 1rem; line-height: 1.6; color: #aaa;">Thank you for reaching out! We have received your inquiry and are currently reviewing it.</p>
        <p style="font-size: 1rem; line-height: 1.6; color: #aaa;">We strive to respond within 24-48 hours. If you need immediate assistance, feel free to contact us directly via WhatsApp or Phone.</p>
        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #333; font-size: 0.85rem; color: #666;">
          <p style="margin: 0;">— Aditya Kolhe</p>
          <p style="margin: 0; color: #e60000; font-weight: bold;">_EYEADI VISUALS</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"_eyeadi Visuals" <${process.env.EMAIL_USER || 'adityakolhe168@gmail.com'}>`,
      to: contact.email,
      subject: `We received your inquiry, ${contact.name}`,
      html: html
    });
    console.log(`✅ Acknowledgment email sent to ${contact.email}`);
  } catch (err) {
    console.error(`⚠️ Failed to send acknowledgment email: ${err.message}`);
  }
};

module.exports = { sendBookingConfirmationEmail, sendContactReplyEmail };
