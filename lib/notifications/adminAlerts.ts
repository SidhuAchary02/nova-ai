import nodemailer from "nodemailer";
import type { KeyFailureStats } from "@/lib/ai/groqKeyManager";

type ApiKeyExhaustedAlertInput = {
  userEmail?: string | null;
  taskType: string;
  courseId?: string | null;
  stats: KeyFailureStats;
};

export async function sendApiKeysExhaustedAlert(input: ApiKeyExhaustedAlertInput) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const service = process.env.SMTP_SERVICE || "gmail";
  const to = process.env.ADMIN_ALERT_EMAIL || "upskillai.in@gmail.com";

  if (!smtpUser || !smtpPass) {
    console.error("CRITICAL - All API Keys Exhausted", input);
    return;
  }

  const transporter = nodemailer.createTransport({
    service,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const nextRecovery = input.stats.nextRecoveryAt
    ? input.stats.nextRecoveryAt.toISOString()
    : "Unknown";

  await transporter.sendMail({
    from: `"UpSkillAi Alerts" <${smtpUser}>`,
    to,
    subject: "CRITICAL - All API Keys Exhausted",
    text: [
      `Timestamp: ${new Date().toISOString()}`,
      `User: ${input.userEmail || "Unknown"}`,
      `Task: ${input.taskType}`,
      `Course ID: ${input.courseId || "N/A"}`,
      `Keys in cooldown: ${input.stats.cooldown}`,
      `Keys exhausted: ${input.stats.exhausted}`,
      `Keys failed: ${input.stats.failed}`,
      `Estimated next recovery: ${nextRecovery}`,
    ].join("\n"),
  });
}
