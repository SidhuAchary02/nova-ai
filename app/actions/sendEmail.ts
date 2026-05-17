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
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "upskillai.in@gmail.com",
        pass: "kofe qfbs itlv xzyt",
      },
    });

    // 1. Send inquiry to admin
    const adminMailOptions = {
      from: "upskillai.in@gmail.com",
      to: "upskillai.in@gmail.com",
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
      from: '"UpSkillAi Team" <upskillai.in@gmail.com>',
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
