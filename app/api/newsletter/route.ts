import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import WelcomeEmail from '@/components/emails/WelcomeEmail';

// Initialize Resend with the key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email presence
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Send automated Welcome Email via Resend
    // Resend sandbox testing uses onboarding@resend.dev. To send to arbitrary emails, 
    // a verified domain is required on Resend.
    try {
      await resend.emails.send({
        from: 'Original Tobey Studio <onboarding@resend.dev>', // Replace with your domain once verified on Resend
        to: email,
        subject: 'Welcome to the Clan! ⚔️',
        react: WelcomeEmail({ email }),
      });
      console.log(`[Newsletter] Welcome email dispatched successfully to ${email}`);
    } catch (emailError: any) {
      console.error('[Newsletter Email Error]', emailError);
      // We don't fail the request if Resend encounters issues (e.g. mock key or unverified email in free tier)
      // to keep user experience smooth, but log it clearly.
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to the newsletter!',
    });
  } catch (error: any) {
    console.error('[Newsletter API Error]', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
