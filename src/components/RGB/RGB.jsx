import { bem } from '@/css/bem.js';
import { classNames } from '@/css/classnames.js';

import './RGB.css';

const [b, e] = bem('rgb');

export const RGB = ({ color, className, ...rest }) => (
  <span {...rest} className={classNames(b(), className)}>
    <i className={e('icon')} style={{ backgroundColor: color }}/>
    {color}
  </span>
);
