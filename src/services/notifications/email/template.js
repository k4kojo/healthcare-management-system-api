const templates = {
  verification: ({ firstName, lastName, token, expiresIn }) => ({
    subject: "Verify Your Account",
    text: `Hello ${firstName} ${lastName},\n\nYour verification code is: ${token}\n\nThis code will expire in ${expiresIn}.\n\nThank you,\nThe Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2a9d8f;">Hello ${firstName} ${lastName},</h2>
        <p style="font-size: 16px;">Your verification code is: <span style="font-size: 24px; font-weight: bold; color: #264653;">${token}</span></p>
        <p style="font-size: 14px; color: #555;">This code will expire in <strong>${expiresIn}</strong>.</p>
        <p style="margin-top: 20px;">Thank you,<br>The Team</p>
      </div>
    `,
  }),

  passwordReset: ({ firstName, lastName, token, expiresIn }) => ({
    subject: "Reset Your Password",
    text: `Hello ${firstName} ${lastName},\n\nYour password reset code is: ${token}\n\nThis code will expire in ${expiresIn}.\n\nIf you didn't request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #e76f51;">Hello ${firstName} ${lastName},</h2>
        <p style="font-size: 16px;">Your password reset code is:</p>
        <p style="font-size: 24px; font-weight: bold; color: #e63946;">${token}</p>
        <p style="font-size: 14px; color: #555;">This code will expire in <strong>${expiresIn}</strong>.</p>
        <p style="font-size: 14px; color: #999;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }),

  appointmentReminder: ({ firstName, lastName, date, doctor, location }) => ({
    subject: "Appointment Reminder",
    text: `Hi ${firstName} ${lastName},\n\nThis is a reminder for your appointment with ${doctor} on ${date} at ${location}.\n\nThank you!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #264653;">Hi ${firstName} ${lastName},</h2>
        <p style="font-size: 16px;">This is a reminder for your appointment with:</p>
        <p style="font-size: 18px; font-weight: bold;">Dr. ${doctor}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p style="margin-top: 20px;">Thank you!</p>
      </div>
    `,
  }),
};

export function renderTemplate(templateName, data) {
  const template = templates[templateName];
  if (!template) throw new Error(`Template ${templateName} not found`);
  return template(data);
}
