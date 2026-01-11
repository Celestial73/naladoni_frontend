import { IndexPage } from '@/pages/IndexPage/IndexPage.jsx';
import { InitDataPage } from '@/pages/InitDataPage.jsx';
import { LaunchParamsPage } from '@/pages/LaunchParamsPage.jsx';
import { ThemeParamsPage } from '@/pages/ThemeParamsPage.jsx';
import { Profile } from '@/pages/Profile.jsx';
import { Feed } from '@/pages/Feed.jsx';
import { Events } from '@/pages/Events.jsx';

export const routes = [
  { path: '/', Component: IndexPage },
  { path: '/feed', Component: Feed, title: 'Feed', useMainLayout: true },
  { path: '/events', Component: Events, title: 'Events', useMainLayout: true },
  { path: '/profile', Component: Profile, title: 'Profile', useMainLayout: true },
  { path: '/init-data', Component: InitDataPage, title: 'Init Data' },
  { path: '/theme-params', Component: ThemeParamsPage, title: 'Theme Params' },
  { path: '/launch-params', Component: LaunchParamsPage, title: 'Launch Params' },
];
