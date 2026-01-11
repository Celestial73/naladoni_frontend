import { Section, Cell, Image, List } from '@telegram-apps/telegram-ui';

import { Link } from '@/components/Link/Link.jsx';
import { Page } from '@/components/Page.jsx';

import tonSvg from './ton.svg';
import projectImage from '../../../assets/photo_2025-12-14_19-07-23.jpg';

export const IndexPage = () => {
  return (
    <Page back={false}>
      <List>
        <Section
          header="Bitches"
          footer="You can use these pages to learn more about features, provided by Telegram Mini Apps and other useful projects"
        >
          <Image src={projectImage} />
          <Link to="/ton-connect">
            <Cell
              before={<Image src={tonSvg} style={{ backgroundColor: '#007AFF' }} />}
              subtitle="Connect your TON wallet"
            >
              TON Connect
            </Cell>
          </Link>
          <Link to="/profile">
            <Cell
              before={<Image src={projectImage} style={{ backgroundColor: '#007AFF' }} />}
              subtitle="User Profile"
            >
              Profile
            </Cell>
          </Link>
        </Section>
        <Section
          header="Application Launch Data"
          footer="These pages help developer to learn more about current launch information"
        >
          <Link to="/feed">
            <Cell subtitle="User Feed">Feed</Cell>
          </Link>
          <Link to="/events">
            <Cell subtitle="User Events">Events</Cell>
          </Link>
          <Link to="/init-data">
            <Cell subtitle="User data, chat information, technical data">Init Data</Cell>
          </Link>
          <Link to="/launch-params">
            <Cell subtitle="Platform identifier, Mini Apps version, etc.">Launch Parameters</Cell>
          </Link>
          <Link to="/theme-params">
            <Cell subtitle="Telegram application palette information">Theme Parameters</Cell>
          </Link>
        </Section>
      </List>
    </Page>
  );
};
