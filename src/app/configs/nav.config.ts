import { NavMenu } from '@app/shared/types/nav-menu.interface';

const dashboard: NavMenu[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    translateKey: 'NAV.DASHBOARD',
    type: 'item',
    iconType: 'feather',
    icon: 'icon-home',
    key: 'dashboard',
    role:['super_admin', 'sub_admin', 'guest_user'],
    submenu: [

    ]
  },
]



const pages: NavMenu[] = [

  {
    path: '',
    title: 'Auth',
    translateKey: 'NAV.PAGES_AUTH',
    type: 'collapse',
    iconType: 'feather',
    icon: 'icon-user',
    key: 'pages.auth',
    role:[],
    submenu: [
      {
        path: '/pages/users',
        title: 'Users',
        translateKey: 'NAV.PAGES_UTILITY_USER',
        type: 'title',
        iconType: '',
        icon: '',
        key: 'pages.auth.user-list',
        role:['super_admin', 'sub_admin'],
        submenu: []
      },
      {
        path: '/pages/guestusers',
        title: 'Guest Users',
        translateKey: 'NAV.PAGES_UTILITY_GUESTUSER',
        type: 'title',
        iconType: '',
        icon: '',
        key: 'pages.auth.guestusers',
        role:['super_admin'],
        submenu: []

      },
      {
        path: '/pages/profile',
        title: 'Profile',
        translateKey: 'NAV.PAGES_UTILITY_PROFILE',
        type: 'item',
        iconType: '',
        icon: '',
        key: 'pages.auth.profile',
        role:['super_admin', 'sub_admin', 'guest_care', 'guest_user'],
        submenu: []
      },
      {
        path: '/pages/activity',
        title: 'Logs',
        translateKey: 'NAV.PAGES_UTILITY_LOGS',
        type: 'item',
        iconType: '',
        icon: '',
        key: 'pages.auth.log-list',
        role:['super_admin'],
        submenu: []
      },
    ]
  },

]





const apps: NavMenu[] = [
  {
    path: '',
    title: 'Apps',
    translateKey: 'NAV.APPS',
    type: 'title',
    iconType: 'feather',
    icon: 'icon-grid',
    key: 'apps',
    role:[],
    submenu: [

      {

        path: '/apps/guests',
        title: 'Guests',
        translateKey: 'NAV.GUESTS',
        type: 'item',
        iconType: 'feather',
        icon: 'icon-users',
        key: 'Guest',
        role:['super_admin','sub_admin','guest_care','guest_user'],
        submenu: [
          {
            path: 'guests/list',
            title: 'List',
            translateKey: 'NAV.GUESTS_LIST',
            type: 'collapse',
            iconType: 'feather',
            icon: 'icon-mail',
            key: 'guest',
            role:['super_admin','sub_admin','guest_care','guest_user'],
            submenu: []
          },
          {
            path: '/guests/create',
            title: 'Create',
            translateKey: 'NAV.GUESTS_CREATE',
            type: 'collapse',
            iconType: 'feather',
            icon: 'icon-mail',
            key: 'guest',
            role:['guest_care'],
            submenu: []
          },
          {
            path: '/guests/blacklist',
            title: 'Black List',
            translateKey: 'NAV.BLACK_LIST',
            type: 'collapse',
            iconType: 'feather',
            icon: 'icon-mail',
            key: 'blacklist',
            role:['super_admin'],
            submenu: []
          },
          {
            path: '/guests/abnormal',
            title: 'Abnormal Guests List',
            translateKey: 'NAV.ABNORMAL_GUESTS',
            type: 'collapse',
            iconType: 'feather',
            icon: 'icon-mail',
            key: 'abnormal',
            role:['super_admin'],
            submenu: []
          },

        ]
      },

      {

        path: '/apps/staff',
        title: 'Staff',
        translateKey: 'NAV.STAFF',
        type: 'item',
        iconType: 'feather',
        icon: 'icon-layers',
        key: 'Staff',
        role:['super_admin','sub_admin','guest_care', 'guest_user'],
        submenu: [
          {
            path: 'staff/list',
            title: 'List',
            translateKey: 'NAV.STAFF_LIST',
            type: 'collapse',
            iconType: 'feather',
            icon: 'icon-mail',
            key: 'staff',
            role:['super_admin','sub_admin','guest_care', 'guest_user'],
            submenu: []
          },
          {
            path: 'staff/create',
            title: 'Create',
            translateKey: 'NAV.STAFF_CREATE',
            type: 'collapse',
            iconType: 'feather',
            icon: 'icon-mail',
            key: 'staff',
            role:['guest_care'],
            submenu: []
          },
        ]
      },

      {
        path: '/Notifications/notification-list',
        title: 'Notifications',
        translateKey: 'NAV.NOTIFICATIONS',
        type: 'item',
        iconType: 'feather',
        icon: 'icon-bell',
        key: 'Notification',
        role:['super_admin','sub_admin','guest_care', 'guest_user'],
        submenu: [        ]
      },

      {

        path: '/Reports/report-list',
        title: 'Reports',
        translateKey: 'NAV.REPORTS',
        type: 'title',
        iconType: 'feather',
        icon: 'icon-file-text',
        key: 'Reports',
        submenu: [],
        role:['super_admin', 'sub_admin', 'guest_user', 'guest_care'],
      },
      {
        path: '/settings/list',
        title: 'Settings',
        translateKey: 'NAV.APPS_SETTINGS',
        type: 'item',
        iconType: 'feather',
        icon: 'icon-settings',
        key: 'setting',
        role:['super_admin','sub_admin', 'guest_user'],
        submenu: []
      },
      {
        path: '/pages/media',
        title: 'Media',
        translateKey: 'NAV.MEDIA',
        type: 'item',
        iconType: 'feather',
        icon: 'icon-image',
        key: 'media',
        role: ['super_admin'],
        submenu: []
      },

    ]
  }
]



export const navConfiguration: NavMenu[] = [
  ...dashboard,
  ...apps,
  ...pages,
]
