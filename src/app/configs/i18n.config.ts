export const supportedLanguages = {
    en_US: 'English',
    ps_AF: 'Pashto',
    dr_AF: 'Dari'
}

export const defaultLanguge = localStorage.getItem('lang') ||  Object.keys(supportedLanguages)[0]
