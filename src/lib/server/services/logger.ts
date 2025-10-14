//  T Y P E S  ----------------------------------------------------------------------- //

type LogData = any;
type LogMessage = string;
type LogOperation = string;
type LogResult = string | number | boolean;
type LogEndpoint = string;
type LogOrigin = string;
type LogReason = string;

//  I N T E R F A C E  --------------------------------------------------------------- //

interface Logger {
	info: (message: LogMessage, data?: LogData) => void;
	warn: (message: LogMessage, data?: LogData) => void;
	error: (message: LogMessage, error?: LogData) => void;
	debug: (message: LogMessage, data?: LogData) => void;
	api: (endpoint: LogEndpoint, origin?: LogOrigin) => void;
	success: (message: LogMessage) => void;
	blocked: (endpoint: LogEndpoint, reason: LogReason) => void;
	db: (operation: LogOperation, result?: LogResult) => void;
	sync: (message: LogMessage, data?: LogData) => void;
}

//  I N T E R F A C E  --------------------------------------------------------------- //

export const logger: Logger = {
	//  G E N E R A L  ------------------------------------------- //

	info: (message, data) => {
		console.info(`[INFO] ${message}`, data || '');
	},

	warn: (message, data) => {
		console.warn(`[WARN] ${message}`, data || '');
	},

	error: (message, error) => {
		console.error(`[ERROR] ${message}`, error || '');
	},

	debug: (message, data) => {
		console.debug(`[DEBUG] ${message}`, data || '');
	},

	//  A P I   H E L P E R S  ----------------------------------- //

	api: (endpoint, origin) => {
		console.info(`[INFO] API ${endpoint} from ${origin || 'unknown'}`);
	},

	success: (message) => {
		console.info(`[INFO] ${message}`);
	},

	blocked: (endpoint, reason) => {
		console.warn(`[WARN] API ${endpoint} blocked: ${reason}`);
	},

	db: (operation, result) => {
		console.info(`[INFO] DB ${operation}${result ? `: ${result}` : ''}`);
	},

	sync: (message, data) => {
		console.info(`[INFO] SYNC ${message}`, data || '');
	}
};
