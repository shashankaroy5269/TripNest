const transporter = require("../config/mail");

class EmailService {
  getSender() {
    const raw = process.env.EMAIL_USER || process.env.SMTP_USER || "noreply@tripnest.com";
    return `"TripNest Travel" <${String(raw).replace(/['"]/g, "").trim()}>`;
  }

    // SEND EMAIL VERIFICATION
    async sendVerificationEmail({ email, name, token }) {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

    console.log(`\n==================================================`);
    console.log(`[EMAIL DISPATCH] Verification link for ${email}:`);
    console.log(`URL: ${verificationUrl}`);
    console.log(`==================================================\n`);

    const mailOptions = {
      from: this.getSender(),
      to: email,
      subject: "TripNest - Please Verify Your Email Address",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">TripNest</h1>
            <p style="color: #64748b; margin-top: 5px; font-size: 14px;">Your Gateway to Unforgettable Journeys</p>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Welcome aboard, ${name}! 🎉</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
              Thank you for registering with TripNest. To activate your account and start discovering extraordinary hotels and holiday packages, please verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                Verify My Email
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 13px; text-align: center;">
              This link will expire in 24 hours. If the button doesn't work, copy and paste this link into your browser:<br/>
              <span style="color: #4f46e5; word-break: break-all;">${verificationUrl}</span>
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            If you did not create an account on TripNest, you can safely ignore this email.
          </p>
        </div>
      `
    };

    try {
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.warn("Nodemailer dispatch failed (using console link fallback):", error.message);
      return { fallback: true, verificationUrl };
    }
  }

    // SEND BOOKING CONFIRMATION EMAIL WITH PDF
    async sendBookingConfirmation({ booking, payment, pdfBuffer }) {
    const recipient = booking.traveler?.email || booking.user?.email;
    if (!recipient) return null;

    const itemName = booking.hotel?.name || booking.package?.title || "TripNest Booking";
    const bookingType = booking.bookingType || "HOTEL";

    console.log(`\n==================================================`);
    console.log(`[EMAIL DISPATCH] Booking Confirmation sent to: ${recipient}`);
    console.log(`Booking Number: ${booking.bookingNumber} | Item: ${itemName}`);
    console.log(`==================================================\n`);

    const mailOptions = {
      from: this.getSender(),
      to: recipient,
      subject: `TripNest Booking Confirmed - ${booking.bookingNumber} 🎉`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800;">TripNest</h1>
            <p style="color: #64748b; margin-top: 5px; font-size: 14px;">Official Booking Confirmation</p>
          </div>

          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 20px; border-radius: 10px; margin-bottom: 25px; text-align: center;">
            <h2 style="margin: 0; font-size: 22px;">Booking Confirmed! ✈️</h2>
            <p style="margin: 8px 0 0; font-size: 15px; opacity: 0.9;">Booking Reference: <strong>${booking.bookingNumber}</strong></p>
          </div>

          <p style="color: #334155; font-size: 15px;">
            Dear <strong>${booking.traveler?.name || "Traveler"}</strong>,
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Your payment was successful and your reservation has been confirmed. Below is a summary of your booking. Your official booking voucher / PDF invoice is attached to this email.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; width: 40%;">Reservation Type</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1e293b;">${bookingType === "HOTEL" ? "Hotel Stay" : "Holiday Package"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Property / Package</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1e293b; font-weight: 600;">${itemName}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Dates / Departure</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1e293b;">
                ${bookingType === "HOTEL" 
                  ? `${this.formatDate(booking.checkIn)} to ${this.formatDate(booking.checkOut)}` 
                  : (booking.departureDate ? this.formatDate(booking.departureDate) : "Flexible")}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Guests / Travelers</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1e293b;">
                ${booking.guests?.adults || 1} Adult(s)${booking.guests?.children ? `, ${booking.guests.children} Children` : ""}
              </td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Total Amount Paid</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #059669; font-weight: 700; font-size: 16px;">
                ₹${booking.priceSnapshot?.totalAmount?.toLocaleString("en-IN") || "-"}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Payment Status</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #059669; font-weight: 600;">
                PAID (${payment?.status || "SUCCESS"})
              </td>
            </tr>
          </table>

          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-size: 13px;">
              📎 <strong>PDF Voucher Attached:</strong> You can present the attached PDF voucher upon arrival or download it anytime from your TripNest dashboard.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            TripNest India Inc. • 24x7 Customer Support • support@tripnest.com
          </p>
        </div>
      `,
      attachments: pdfBuffer
        ? [
            {
              filename: `TripNest-${booking.bookingNumber}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf"
            }
          ]
        : []
    };

    try {
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.warn("Booking confirmation email dispatch failed:", error.message);
      return { fallback: true };
    }
  }

  formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }
}

module.exports = new EmailService();