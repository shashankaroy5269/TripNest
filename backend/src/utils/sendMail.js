const transporter = require("../config/mail");

const sendMail = async (to, verifyLink) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
  </head>

  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff;border-radius:12px;overflow:hidden;
            box-shadow:0 8px 25px rgba(0,0,0,.1);">

            <tr>
              <td
                style="background:#4F46E5;padding:30px;text-align:center;">

                <h1 style="margin:0;color:#fff;">
                 MyStore
                </h1>

                <p style="color:#E0E7FF;margin-top:10px;">
                  Product Management System
                </p>

              </td>
            </tr>

            <tr>
              <td style="padding:40px;">

                <h2 style="margin-top:0;">
                  Verify Your Email
                </h2>

                <p
                  style="font-size:16px;color:#555;line-height:28px;">

                  Thank you for registering with
                  <strong>MyStore</strong>.

                  Please click the button below to verify your email address
                  and activate your account.

                </p>

                <div style="text-align:center;margin:40px 0;">

                  <a
                    href="${verifyLink}"
                    style="
                    display:inline-block;
                    background:#4F46E5;
                    color:#ffffff;
                    text-decoration:none;
                    padding:15px 35px;
                    border-radius:8px;
                    font-size:18px;
                    font-weight:bold;
                    ">

                    Verify Email

                  </a>

                </div>

               
                  This link will expire soon.

                  <br><br>

                  © 2026 MyStore. All Rights Reserved.

                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"MyStore" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email",
    html,
  });
};

module.exports = sendMail;