import { apiService } from './services/apiService.js';
import { updateUserInfo } from './utils/userInfo.js';
import { createMenu } from './utils/menu.js';
import { translateToEnglish } from './utils/translateModule.js';
import { showAlert } from './utils/showArlert.js';

export async function loadModule(module) {
    const url = `${urlBase}/login/token`;
    const token = localStorage.getItem('token');

    if (token) {
        try {
            const data = await apiService.fetchData(url, 'GET');
            const hasAccess = data.modules.some(item => item.link === module);

            if (!hasAccess) {
                const firstAccessibleModule = data.modules.length > 0 ? data.modules[0].link : null;

                if (firstAccessibleModule) {
                    window.location.href = `${urlBase}/${firstAccessibleModule}`;
                } else {
                    window.location.href = urlBase;
                }
                return;
            }

            $('#spinner').removeClass('show');
            updateUserInfo(data);
            createMenu(data.modules, module, data);
            const cacheBust = Date.now();
            const moduleScript = await import(`./modules/${translateToEnglish(module)}.js?m=${cacheBust}`);
            moduleScript.initModule(data, module);
        } catch (error) {
            if (error.message.includes('401')) {
                localStorage.setItem('tokenExpired', 'true');
                window.location.href = urlBase;
            } else {
                showAlert('Error de conexión.', 'danger');
            }
        }
    } else {
        window.location.href = urlBase;
    }
}
