import { InitDataPage } from '@/pages/InitDataPage.jsx';
import { LaunchParamsPage } from '@/pages/LaunchParamsPage.jsx';
import { ThemeParamsPage } from '@/pages/ThemeParamsPage.jsx';
import { Profile}  from '@/pages/Profile.jsx';
import { NewProfile } from '@/pages/NewProfile.jsx';
import { EditProfile } from '@/pages/EditProfile.jsx';
import { NewEditProfile } from '@/pages/NewEditProfile.jsx';
import { Feed } from '@/pages/Feed.jsx';
import { Events } from '@/pages/Events.jsx';
import { CreateEvent } from '@/pages/CreateEvent.jsx';

export const routes = [
  { path: '/feed', Component: Feed, title: 'Feed', useMainLayout: true },
  { path: '/events', Component: Events, title: 'Events', useMainLayout: true },
  { path: '/profile', Component: NewProfile, title: 'Profile', useMainLayout: true },
  { path: '/profile/edit', Component: NewEditProfile, title: 'Edit Profile' },
  { path: '/events/create', Component: CreateEvent, title: 'Create Event' },
  { path: '/events/edit/:id', Component: CreateEvent, title: 'Edit Event' },
  { path: '/init-data', Component: InitDataPage, title: 'Init Data' },
  { path: '/theme-params', Component: ThemeParamsPage, title: 'Theme Params' },
  { path: '/launch-params', Component: LaunchParamsPage, title: 'Launch Params' },
];
