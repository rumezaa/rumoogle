import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { NextResponse } from "next/server";

// Visitors' text goes into an HTML email, so escape it.
const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Export the POST method handler as a named export
export async function POST(req) {
  const { email, subject, message, cc, bcc } = await req.json();

  // Server-only credentials. Never prefix these with NEXT_PUBLIC_ and never log them.
  // (Vercel reserves the standard AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY names.)
  const AWS_ACCESS_KEY = process.env.SES_ACCESS_KEY_ID;
  const AWS_ACCESS_KEY_SECRET = process.env.SES_SECRET_ACCESS_KEY;

  let sesClient = null;

  try {
    sesClient = new SESClient({
      region: "us-east-1", 
      credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_ACCESS_KEY_SECRET,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error connecting to SES", error: error.message },
      { status: 500 }
    );
  }

  // Prepare email params
  const params = {
    Source: "rumezaft@gmail.com", // Verified email address in AWS SES
    Destination: {
      ToAddresses: ["rumezaft@gmail.com"], // Replace with your dynamic recipient if needed
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: `
            <li>Return email(s): ${escapeHtml(email)} ${escapeHtml(cc)} ${escapeHtml(bcc)}</li>
            <p>${escapeHtml(message)}</p>`,
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    // Send email using AWS SES
    const command = new SendEmailCommand(params);
    const data = await sesClient.send(command);
    // Email sent successfully
    return NextResponse.json(
      { status: "success", message: "Email sent successfully!", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json(
      {
        status: "error",
        message: "An error occurred while sending the email",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
