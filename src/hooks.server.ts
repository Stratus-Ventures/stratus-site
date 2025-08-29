

//  B L O C K   S P A M   P A T H S  ------------------------------------------------- //

const SPAM_PATHS = [
	'wp-admin','wp-login','wp-content','wp-includes','wp-config','wp-json','wordpress',
    'xmlrpc.php','wp-cron.php','wp-trackback.php','phpmyadmin','phpMyAdmin','pma','adminer', 
    'mysql','admin.php','index.php','config.php','install.php','setup.php','administrator', 
    'cpanel','webmail','panel','dashboard','manager','control','backend','.env','.git','.svn',
    '.htaccess','.htpasswd','web.config','composer.json','package.json','cgi-bin','scripts','cgi',
    'bin','drupal','sites/default','user/login','node/','joomla','administrator/index.php',
    'components/','sitemap.xml','favicon.ico','crossdomain.xml','clientaccesspolicy.xml','api/v1',
    'rest/api','graphql','api.php','backup','backups','dump','.bak','.old','.tmp','temp','test',
    'demo','dev','security','secure','ssl','admin/login','login.php','user.php','account.php',
    'auth.php','filemanager','file-manager','files','upload','typo3','concrete5','modx','prestashop',
	'mobile', 'app', 'ios', 'android'
];

export async function handle({ event, resolve }) {
	const path = event.url.pathname.toLowerCase();
	
	if (SPAM_PATHS.some(spam => path.includes(spam))) {
		return new Response('', { 
			status: 404,
			headers: { 'content-type': 'text/plain' }
		});
	}

	return resolve(event);
}