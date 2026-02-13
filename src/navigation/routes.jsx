import { InitDataPage } from '@/pages/Debug/InitDataPage.jsx';
import { LaunchParamsPage } from '@/pages/Debug/LaunchParamsPage.jsx';
import { ThemeParamsPage } from '@/pages/Debug/ThemeParamsPage.jsx';
import { Profile } from '@/pages/Profile/Profile.jsx';
import { ViewUserProfile } from '@/pages/Profile/ViewUserProfile.jsx';
import { EditProfile } from '@/pages/Profile/EditProfile.jsx';
import { Feed } from '@/pages/Feed/Feed.jsx';
import { Events } from '@/pages/Events/Events.jsx';
import { EventDetail } from '@/pages/Events/EventDetail.jsx';
import { CreateEvent } from '@/pages/Events/CreateEvent.jsx';

export const routes = [
  { path: '/feed', Component: Feed, title: 'Feed', useMainLayout: true },
  { path: '/events', Component: Events, title: 'Events', useMainLayout: true },
  { path: '/profile', Component: Profile, title: 'Profile', useMainLayout: true },
  { path: '/user/:userId', Component: ViewUserProfile, title: 'User Profile' },
  { path: '/profile/edit', Component: EditProfile, title: 'Edit Profile' },
  { path: '/events/create', Component: CreateEvent, title: 'Create Event' },
  { path: '/events/edit/:id', Component: CreateEvent, title: 'Edit Event' },
  { path: '/events/:id/detail', Component: EventDetail, title: 'Event Detail', useMainLayout: true },
  { path: '/init-data', Component: InitDataPage, title: 'Init Data' },
  { path: '/theme-params', Component: ThemeParamsPage, title: 'Theme Params' },
  { path: '/launch-params', Component: LaunchParamsPage, title: 'Launch Params' },
];
