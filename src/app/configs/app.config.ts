import { AppConfig } from '@app/shared/types/app-config.interface';
import { defaultLanguge } from './i18n.config'

export const AppConfiguration : AppConfig = {
    layoutType: 'vertical',
    sideNavCollapse: false,
    mobileNavCollapse: false,
    lang: defaultLanguge,
    navMenuColor: 'light',
    headerNavColor: '#ffffff'
}

export const API_ENDPOINT = '/api'