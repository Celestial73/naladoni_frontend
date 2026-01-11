import type { ComponentType, JSX } from 'react';

import { IndexPage } from '@/pages/IndexPage/IndexPage';
import { InitDataPage } from '@/pages/InitDataPage.tsx';
import { LaunchParamsPage } from '@/pages/LaunchParamsPage.tsx';
import { ThemeParamsPage } from '@/pages/ThemeParamsPage.tsx';
import { Profile } from '@/pages/Profile.tsx';
import { Feed } from '@/pages/Feed.tsx';
import { Events } from '@/pages/Events.tsx';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
  useMainLayout?: boolean;
}

export const routes: Route[] = [
  { path: '/', Component: IndexPage },
  { path: '/feed', Component: Feed, title: 'Feed', useMainLayout: true },
  { path: '/events', Component: Events, title: 'Events', useMainLayout: true },
  { path: '/profile', Component: Profile, title: 'Profile', useMainLayout: true },
  { path: '/init-data', Component: InitDataPage, title: 'Init Data' },
  { path: '/theme-params', Component: ThemeParamsPage, title: 'Theme Params' },
  { path: '/launch-params', Component: LaunchParamsPage, title: 'Launch Params' },
];
