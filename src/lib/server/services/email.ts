//  E M A I L   S E R V I C E  --------------------------------------------------------- //

import { Resend } from 'resend';
import { logger } from './logger';
import { env } from '$env/dynamic/private';

let resend: Resend | null = null;

// Initialize Resend only if API key is available
console.log('RESEND_API_KEY:', env.RESEND_API_KEY ? 'SET' : 'NOT SET');
if (env.RESEND_API_KEY) {
	resend = new Resend(env.RESEND_API_KEY);
	console.log('Resend initialized successfully');
}

//  A U T H   C O D E   E M A I L  --------------------------------------------------- //

export async function sendAuthCodeEmail(authCode: string, adminUrl: string): Promise<void> {
	// 1. Validate required parameters
	// 2. Send email with auth code and URL
	// 3. Handle any errors

	// ------------------------------------------------------------------- //

	// [ STEP 1. ] - Validate required parameters
	if (!authCode || !adminUrl) {
		throw new Error('Auth code and test URL are required');
	}

	if (!env.RESEND_API_KEY || !resend) {
		logger.warn('RESEND_API_KEY not configured, skipping email send');
		return;
	}

	try {
		// [ STEP 2. ] - Send email with auth code and URL
		await resend.emails.send({
			from: 'Stratus - Auth System <auth@stratus-ventures.org>',
			to: ['jason@stratus-ventures.org'],
			subject: 'New Auth Code Generated',
			html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Auth Code</title>
                </head>
                <body style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    background-color: #ffffff;
                    color: #0a0a0a;
                    margin: 0;
                    padding: 0;
                    line-height: 1.2;
                ">
                    <div style="
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 40px 20px;
                    ">
                        <div style="
                            background: #fafafa;
                            border: 1px solid #e5e5e5;
                            border-radius: 12px;
                            padding: 32px;
                            text-align: center;
                        ">

                            <div style="
                                background: #ffffff;
                                border: 1px solid #e5e5e5;
                                border-radius: 8px;
                                padding: 24px;
                                margin: 24px 0;
                            ">
                                <code style="
                                    padding: 12px 16px;
                                    border-radius: 6px;
                                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', Consolas, 'Courier New', monospace;
                                    font-size: 20px;
                                    font-weight: 600;
                                    letter-spacing: 0.1em;
                                    color: #0a0a0a;
                                    display: inline-block;
                                ">${authCode}</code>
                            </div>

                            <a href="${adminUrl}" style="
                                display: inline-block;
                                background: #0a0a0a;
                                color: #ffffff;
                                text-decoration: none;
                                padding: 12px 24px;
                                border-radius: 6px;
                                font-weight: 500;
                                font-size: 16px;
                                transition: background-color 0.2s ease;
                            ">Access Site</a>
                        </div>
                    </div>
                </body>
                </html>
            `
		});

		logger.success('Auth code email sent successfully');
	} catch (error) {
		// [ STEP 3. ] - Handle any errors
		logger.error('Failed to send auth code email', error);
		throw error;
	}
}
