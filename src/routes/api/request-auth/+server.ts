import { json } from '@sveltejs/kit';
import { requestAuthCode } from '$lib/server/services/auth';
import { logger } from '$lib/server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    try {
        await requestAuthCode(url.origin);
        logger.info('Auth code requested via GET');

        return json({
            success: true,
            message: 'Auth code sent to email'
        });
    } catch (error) {
        logger.error('Failed to request auth code via GET', error);

        return json(
            {
                success: false,
                error: 'Failed to send auth code'
            },
            { status: 500 }
        );
    }
};