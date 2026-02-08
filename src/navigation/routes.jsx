import { InitDataPage } from '@/pages/Debug/InitDataPage.jsx';
import { LaunchParamsPage } from '@/pages/Debug/LaunchParamsPage.jsx';
import { ThemeParamsPage } from '@/pages/Debug/ThemeParamsPage.jsx';
import { Profile } from '@/pages/Profile/Profile.jsx';
import { NewProfile } from '@/pages/Profile/NewProfile.jsx';
import { ViewUserProfile } from '@/pages/Profile/ViewUserProfile.jsx';
import { EditProfile } from '@/pages/Profile/EditProfile.jsx';
import { NewEditProfile } from '@/pages/Profile/NewEditProfile.jsx';
import { Feed } from '@/pages/Feed/Feed.jsx';
import { NewFeed } from '@/pages/Feed/NewFeed.jsx';
import { Events } from '@/pages/Events/Events.jsx';
import { CreateEvent } from '@/pages/Events/CreateEvent.jsx';

export const routes = [
  { path: '/feed', Component: NewFeed, title: 'Feed', useMainLayout: true },
  { path: '/events', Component: Events, title: 'Events', useMainLayout: true },
  { path: '/profile', Component: NewProfile, title: 'Profile', useMainLayout: true },
  { path: '/user/:userId', Component: ViewUserProfile, title: 'User Profile' },
  { path: '/profile/edit', Component: NewEditProfile, title: 'Edit Profile' },
  { path: '/events/create', Component: CreateEvent, title: 'Create Event' },
  { path: '/events/edit/:id', Component: CreateEvent, title: 'Edit Event' },
  { path: '/init-data', Component: InitDataPage, title: 'Init Data' },
  { path: '/theme-params', Component: ThemeParamsPage, title: 'Theme Params' },
  { path: '/launch-params', Component: LaunchParamsPage, title: 'Launch Params' },
];
