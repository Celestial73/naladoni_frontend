import { isRGB } from '@tma.js/sdk-react';
import { Cell, Checkbox, Section } from '@telegram-apps/telegram-ui';

import { RGB } from '@/components/RGB/RGB.jsx';
import { Link } from '@/components/Link/Link.jsx';
import { bem } from '@/css/bem.js';

import './DisplayData.css';

const [, e] = bem('display-data');

export const DisplayData = ({ header, rows }) => (
  <Section header={header}>
    {rows.map((item, idx) => {
      let valueNode;

      if (item.value === undefined) {
        valueNode = <i>empty</i>;
      } else {
        if ('type' in item) {
          valueNode = <Link to={item.value}>Open</Link>;
        } else if (typeof item.value === 'string') {
          valueNode = isRGB(item.value)
            ? <RGB color={item.value}/>
            : item.value;
        } else if (typeof item.value === 'boolean') {
          valueNode = <Checkbox checked={item.value} disabled/>;
        } else {
          valueNode = item.value;
        }
      }

      return (
        <Cell
          className={e('line')}
          subhead={item.title}
          readOnly
          multiline={true}
          key={idx}
        >
          <span className={e('line-value')}>
            {valueNode}
          </span>
        </Cell>
      );
    })}
  </Section>
);
