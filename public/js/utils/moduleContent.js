import { updateUserInfo } from './userInfo.js';
import { translateToEnglish } from './translateModule.js';

export const loadModuleContent = async (item, data) => {
    const contentContainer = document.getElementById('content');
    const moduleContent = await fetchModuleContent(item.link);

    if (moduleContent) {
        contentContainer.classList.add('fade');
        contentContainer.classList.remove('show');

        setTimeout(() => {
            contentContainer.innerHTML = moduleContent.innerHTML;
            contentContainer.classList.add('show');
            updateModuleInfo(item, data);
        }, 250);
    }
};

const fetchModuleContent = async (module) => {
    const response = await fetch(`${urlBase}/${module}`);
    if (response.ok) {
        const html = await response.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.querySelector('#content');
    } else {
        console.error('Error al cargar el contenido del módulo');
        return null;
    }
};

const updateModuleInfo = async (item, data) => {
    const moduleTitle = document.getElementById('moduleTitle');
    const moduleIcon = document.getElementById('moduleIcon');
    const cacheBust = Date.now();
    const moduleScript = await import(`../modules/${translateToEnglish(item.link)}.js?m=${cacheBust}`);
    moduleTitle.textContent = item.module;
    moduleIcon.className = `${item.icon} me-2 fa-2x text-dark`;
    updateUserInfo(data);
    moduleScript.initModule(data, item.link);
};
