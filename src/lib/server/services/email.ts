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

export async function sendAuthCodeEmail(authCode: string, testUrl: string): Promise<void> {

    // 1. Validate required parameters
    // 2. Send email with auth code and URL
    // 3. Handle any errors

    // ------------------------------------------------------------------- //

    // [ STEP 1. ] - Validate required parameters
    if (!authCode || !testUrl) {
        throw new Error('Auth code and test URL are required');
    }

    if (!env.RESEND_API_KEY || !resend) {
        logger.warn('RESEND_API_KEY not configured, skipping email send');
        return;
    }

    try {
        // [ STEP 2. ] - Send email with auth code and URL
        await resend.emails.send({
            from: 'Auth System <auth@stratus-ventures.org>',
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
                    font-family: 'Geist', ui-sans-serif, system-ui, sans-serif;
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
                            <h1 style="
                                font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
                                font-weight: 500;
                                font-size: 24px;
                                margin: 0 0 24px 0;
                                color: #0a0a0a;
                                letter-spacing: -0.025em;
                            ">New Authentication Code</h1>

                            <div style="
                                background: #ffffff;
                                border: 1px solid #e5e5e5;
                                border-radius: 8px;
                                padding: 24px;
                                margin: 24px 0;
                            ">
                                <p style="
                                    font-weight: 500;
                                    font-size: 16px;
                                    margin: 0 0 12px 0;
                                    color: #0a0a0a;
                                ">Auth Code:</p>
                                <code style="
                                    background: #f4f4f4;
                                    border: 1px solid #e5e5e5;
                                    padding: 12px 16px;
                                    border-radius: 6px;
                                    font-family: 'JetBrains Mono', monospace;
                                    font-size: 20px;
                                    font-weight: 600;
                                    letter-spacing: 0.1em;
                                    color: #0a0a0a;
                                    display: inline-block;
                                ">${authCode}</code>
                            </div>

                            <div style="
                                background: #ffffff;
                                border: 1px solid #e5e5e5;
                                border-radius: 8px;
                                padding: 24px;
                                margin: 24px 0;
                            ">
                                <p style="
                                    font-weight: 500;
                                    font-size: 16px;
                                    margin: 0 0 12px 0;
                                    color: #0a0a0a;
                                ">Test URL:</p>
                                <a href="${testUrl}" style="
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
                                <p style="
                                    font-size: 14px;
                                    color: #737373;
                                    margin: 12px 0 0 0;
                                    word-break: break-all;
                                ">${testUrl}</p>
                            </div>

                            <p style="
                                font-size: 14px;
                                color: #737373;
                                margin: 24px 0 0 0;
                                font-style: italic;
                            ">This code was automatically generated by the Stratus auth system.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        logger.success('Auth code email sent successfully');

    } catch (error) {
        // [ STEP 3. ] - Handle any errors
        logger.error('Failed to send auth code email', error);
        throw error;
    }
}