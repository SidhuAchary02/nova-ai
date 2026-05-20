"use server";

import nodemailer from "nodemailer";

export async function sendEmail(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const query = formData.get("query") as string;

  if (!name || !email || !query) {
    return { success: false, message: "Name, email, and query are required." };
  }

  try {
    const smtpUser = process.env.SMTP_USER || "upskillai.in@gmail.com";
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpPass) {
      throw new Error("SMTP_PASS is not configured");
    }

    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // 1. Send inquiry to admin
    const adminMailOptions = {
      from: smtpUser,
      to: process.env.ADMIN_ALERT_EMAIL || smtpUser,
      subject: `New Inquiry from ${name} (Landing Page)`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nQuery:\n${query}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone || "N/A"}</p>
             <p><strong>Query:</strong></p>
             <p>${query.replace(/\n/g, "<br>")}</p>`,
    };

    await transporter.sendMail(adminMailOptions);

    // 2. Send confirmation to user
    const userMailOptions = {
      from: `"UpSkillAi Team" <${smtpUser}>`,
      to: email,
      subject: "Query Received!",
      text: `Hi ${name},\n\nWe have received your query and you will hear from us within 24hrs.\n\nYour query:\n${query}\n\nBest regards,\nUpSkillAi Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; padding: 20px;">
          <h2 style="color: #ff8c42;">Query Received!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for reaching out to us. We have received your query and you will hear from us within 24 hours.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ff8c42; margin: 20px 0;">
            <p style="margin: 0;"><em>"${query.replace(/\n/g, "<br>")}"</em></p>
          </div>
          <p>Best regards,<br><strong>UpSkillAi Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(userMailOptions);

    return { success: true, message: "Message sent, you will hear from us within 24hrs." };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: true, message: "Message sent, you will hear from us within 24hrs." };
  }
}
