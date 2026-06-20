
export type Role = 'super_admin' | 'sub_admin' | 'guest_user' | 'guest_care';

/**
 * Single report card metadata + click behavior.
 */
export interface ReportCard {
  key: string;
  titleKey: string;
  descKey: string;
  roles: Role[];
  action: () => void;
}


export interface ReportActions {
  guestByTypeReport: () => void;
  guestByGenderReport: () => void;
  guestByHotel: () => void;
  guestByCity: () => void;
  guestByCountry: () => void;
  guestByResidence: () => void;
  guestByUser: () => void;
  guestByZone: () => void;

  // Staff & hotel reports (existing)
  Staff: () => void;
  StaffbyHotel: () => void;
  StaffbyHotelType: () => void;
  StaffbyGender: () => void;
  hotelReport: () => void;

  // New examples you added
  guestsTrend: () => void;
  occupancyReport: () => void;
  repeatVsNew: () => void;
  exceptionReport: () => void;
}


export const REPORTS = (component: ReportActions): ReportCard[] => [
  {
    key: 'guest_by_type',
    titleKey: 'RE.report_by_type',
    descKey: 'RE.report_by_type_msg',
    roles: ['super_admin', 'sub_admin', 'guest_user', 'guest_care'],
    action: () => component.guestByTypeReport(),
  },
  {
    key: 'guest_by_gender',
    titleKey: 'RE.guest_by_gender',
    descKey: 'RE.guest_by_gender_msg',
    roles: ['super_admin', 'sub_admin', 'guest_user', 'guest_care'],
    action: () => component.guestByGenderReport(),
  },
  {
    key: 'guest_by_hotel',
    titleKey: 'RE.guest_by_hotel',
    descKey: 'RE.guest_by_hotel_msg',
    roles: ['super_admin', 'sub_admin', 'guest_user', 'guest_care'],
    action: () => component.guestByHotel(),
  },
  {
    key: 'guest_by_city',
    titleKey: 'RE.guest_by_city',
    descKey: 'RE.guest_by_city_msg',
    roles: ['super_admin', 'sub_admin', 'guest_user'],
    action: () => component.guestByCity(),
  },
  {
    key: 'guest_by_country',
    titleKey: 'RE.guest_by_country',
    descKey: 'RE.guest_by_country_msg',
    roles: ['super_admin', 'sub_admin', 'guest_user'],
    action: () => component.guestByCountry(),
  },
  {
    key: 'guest_by_residence',
    titleKey: 'RE.guest_by_residence',
    descKey: 'RE.guest_by_residence_msg',
    roles: ['super_admin', 'sub_admin', 'guest_user'],
    action: () => component.guestByResidence(),
  },
  {
    key: 'guest_by_user',
    titleKey: 'RE.guest_by_user',
    descKey: 'RE.guest_by_user_msg',
    roles: ['super_admin', 'sub_admin'],
    action: () => component.guestByUser(),
  },
  {
    key: 'guest_by_zone',
    titleKey: 'RE.guest_by_zone',
    descKey: 'RE.guest_by_zone_msg',
    roles: ['super_admin', 'sub_admin'],
    action: () => component.guestByZone(),
  },

  // Staff & hotel (from your template)
  {
    key: 'staff',
    titleKey: 'RE.staff',
    descKey: 'RE.staff_msg',
    roles: ['super_admin', 'sub_admin'],
    action: () => component.Staff(),
  },
  {
    key: 'staff_hotel',
    titleKey: 'RE.staff_hotel',
    descKey: 'RE.staff_hotel_msg',
    roles: ['super_admin', 'sub_admin'],
    action: () => component.StaffbyHotel(),
  },
  {
    key: 'staff_hotel_type',
    titleKey: 'RE.staff_hotel_type',
    descKey: 'RE.staff_hotel_type_msg',
    roles: ['super_admin', 'sub_admin'],
    action: () => component.StaffbyHotelType(),
  },
  {
    key: 'staff_gender',
    titleKey: 'RE.staff_gender',
    descKey: 'RE.staff_gender_msg',
    roles: ['super_admin', 'sub_admin'],
    action: () => component.StaffbyGender(),
  },
  {
    key: 'hotel',
    titleKey: 'RE.hotel',
    descKey: 'RE.hotel_msg',
    roles: ['super_admin', 'sub_admin'],
    action: () => component.hotelReport(),
  },

  {
    key: 'trend_guests',
    titleKey: 'RE.trend_guests',
    descKey: 'RE.trend_guests_msg',
    roles: ['super_admin', 'sub_admin'],
    action: () => component.guestsTrend(),
  },
  {
    key: 'occupancy',
    titleKey: 'RE.occupancy',
    descKey: 'RE.occupancy_msg',
    roles: ['super_admin', 'sub_admin'],
    action: () => component.occupancyReport(),
  },
  {
    key: 'repeat_vs_new',
    titleKey: 'RE.repeat_vs_new',
    descKey: 'RE.repeat_vs_new_msg',
    roles: ['super_admin', 'sub_admin', 'guest_care'],
    action: () => component.repeatVsNew(),
  },
  {
    key: 'exceptions',
    titleKey: 'RE.exceptions',
    descKey: 'RE.exceptions_msg',
    roles: ['super_admin', 'sub_admin'],
    action: () => component.exceptionReport(),
  },
];


export const ALL_REPORT_KEYS = [
  'guest_by_type',
  'guest_by_gender',
  'guest_by_hotel',
  'guest_by_city',
  'guest_by_country',
  'guest_by_residence',
  'guest_by_user',
  'guest_by_zone',
  'staff',
  'staff_hotel',
  'staff_hotel_type',
  'staff_gender',
  'hotel',
  'trend_guests',
  'occupancy',
  'repeat_vs_new',
  'exceptions',
] as const;
export type ReportKey = typeof ALL_REPORT_KEYS[number];
