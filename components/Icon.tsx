import React from 'react';

type IconName = 'dashboard' | 'masters' | 'inventory' | 'vouchers' | 'reports' | 'plus' | 'trash' | 'upload' | 'close' | 'warning' | 'settings' | 'logout' | 'sparkles' | 'arrow-up-right' | 'arrow-down-left' | 'users' | 'wallet' | 'download' | 'check-circle' | 'x-circle' | 'spinner' | 'wand-sparkles';

interface IconProps {
  name: IconName;
  className?: string;
}

// FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const ICONS: Record<IconName, React.ReactElement> = {
  dashboard: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v16.5h16.5M3.75 3h16.5M3.75 3v16.5m16.5-16.5v16.5m-16.5-16.5h16.5m-16.5 0h.008v.008H3.75V3zm0 16.5h.008v.008H3.75v-.008zm16.5 0h.008v.008h-.008v-.008zm0-16.5h.008v.008h-.008V3z" />,
  masters: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
  inventory: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4" />,
  vouchers: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H12m4.5 0H21m-1.5 0H12m0 0H7.5m0 0H3m4.5 0V12m6.5.75l-4.5-4.5" />,
  reports: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />,
  plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
  trash: <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />,
  upload: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
  close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  warning: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
  settings: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.008 1.11-1.226.55-.218 1.19-.243 1.76.012a2.25 2.25 0 011.08 1.838l.003.045.01.21.004.05.003.042a2.25 2.25 0 01-1.63 2.59.38.38 0 00-.32 0 2.25 2.25 0 01-2.59-1.63l-.042-.003-.05-.004-.21-.01-.045-.003a2.25 2.25 0 01-1.838-1.08c-.255-.57-.23-1.21.012-1.76.218-.55.684-1.017 1.226-1.11.09-.036.18-.06.27-.082zm.315 11.235a2.25 2.25 0 01-1.08-1.838l-.003-.045-.01-.21-.004-.05-.003-.042a2.25 2.25 0 011.63-2.59.38.38 0 00.32 0 2.25 2.25 0 012.59 1.63l.042.003.05.004.21.01.045.003a2.25 2.25 0 011.838 1.08.75.75 0 001.213-.715 3.75 3.75 0 00-3.063-3.063.38.38 0 00-.32 0 3.75 3.75 0 00-3.063 3.063.75.75 0 00.715 1.213 2.25 2.25 0 011.08 1.838l.003.045.01.21.004.05.003.042a2.25 2.25 0 01-1.63 2.59.38.38 0 00-.32 0 2.25 2.25 0 01-2.59-1.63l-.042-.003-.05-.004-.21-.01-.045-.003a2.25 2.25 0 01-1.838-1.08.75.75 0 00-1.213.715 3.75 3.75 0 003.063 3.063.38.38 0 00.32 0 3.75 3.75 0 003.063-3.063.75.75 0 00-.715-1.213z" />,
  logout: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />,
  sparkles: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.923-2.923L12 17.25l1.178-.398a3.375 3.375 0 002.923-2.923L16.5 12.75l.398 1.178a3.375 3.375 0 002.923 2.923L21 17.25l-1.178.398a3.375 3.375 0 00-2.923 2.923z" />,
  'arrow-up-right': <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />,
  'arrow-down-left': <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />,
  users: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.625.93.998 2.043.998 3.228z" />,
  wallet: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />,
  download: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />,
  'check-circle': <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  'x-circle': <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  'spinner': <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001a.75.75 0 01.487.879l-1.026 3.076a.75.75 0 01-.879.487l-3.076-1.026a.75.75 0 01-.487-.879zM19.023 9.348a8.966 8.966 0 00-4.663-4.663m-4.663 0a8.966 8.966 0 00-4.663 4.663m0 0a8.966 8.966 0 004.663 4.663m4.663 0a8.966 8.966 0 004.663-4.663" />,
  'wand-sparkles': <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-3.022 3.022c.133.57.465.998.924 1.332a3 3 0 004.142-1.332 3 3 0 00-1.332-4.142 3 3 0 00-1.71- .522zm-3.022 3.022a3 3 0 003.022-3.022m-3.022 3.022a3 3 0 01-3.022-3.022m3.022 3.022l-.522 1.71m3.022-3.022l1.71.522m0 0l1.71-.522m-1.71.522a3 3 0 01-3.022 3.022m3.022-3.022a3 3 0 013.022 3.022m0 0l.522-1.71m-3.022 3.022l-.522-1.71m-1.71.522l-1.71-.522m0 0l-1.71.522M6.47 10.97a3 3 0 010 4.242 3 3 0 01-4.242 0 3 3 0 010-4.242 3 3 0 014.242 0z" />,
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {ICONS[name]}
    </svg>
  );
};

export default Icon;