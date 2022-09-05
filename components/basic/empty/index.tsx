import * as React from 'react';
import classNames from 'classnames';
import { ConfigContext } from '../config-provider';
import LocaleReceiver from '../../locale-provider/antd-locale-provider/LocaleReceiver';
import DefaultEmptyImg from './empty';
import SimpleEmptyImg from './simple';
import CustomEmptyImg from './customEmpty';

const defaultEmptyImg = <DefaultEmptyImg />;
const simpleEmptyImg = <SimpleEmptyImg />;
const customEmptyImg = <CustomEmptyImg />;

export interface TransferLocale {
  description: string;
}

export interface EmptyProps {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  /** @since 3.16.0 */
  imageStyle?: React.CSSProperties;
  image?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

interface EmptyType extends React.FC<EmptyProps> {
  PRESENTED_IMAGE_DEFAULT: React.ReactNode;
  PRESENTED_IMAGE_SIMPLE: React.ReactNode;
  PRESENTED_IMAGE_CUSTOM: React.ReactNode;
}

const Empty: EmptyType = ({
  className,
  prefixCls: customizePrefixCls,
  image = defaultEmptyImg,
  description,
  children,
  imageStyle,
  ...restProps
}) => {
  const { getPrefixCls, direction } = React.useContext(ConfigContext);

  return (
    <LocaleReceiver componentName="Empty">
      {(locale: TransferLocale) => {
        const prefixCls = getPrefixCls('empty', customizePrefixCls);
        const des = typeof description !== 'undefined' ? description : locale.description;
        const alt = typeof des === 'string' ? des : 'empty';

        let imageNode: React.ReactNode = null;

        if (typeof image === 'string') {
          imageNode = <img alt={alt} src={image} />;
        } else {
          imageNode = image;
        }

        return (
          <div
            className={classNames(
              prefixCls,
              {
                [`${prefixCls}-normal`]: image === simpleEmptyImg,
                [`${prefixCls}-rtl`]: direction === 'rtl',
              },
              className,
            )}
            {...restProps}
          >
            <div className={`${prefixCls}-image`} style={imageStyle}>
              {imageNode}
            </div>
            {des && <div className={`${prefixCls}-description`}>{des}</div>}
            {children && <div className={`${prefixCls}-footer`}>{children}</div>}
          </div>
        );
      }}
    </LocaleReceiver>
  );
};

Empty.PRESENTED_IMAGE_DEFAULT = defaultEmptyImg;
Empty.PRESENTED_IMAGE_SIMPLE = simpleEmptyImg;
Empty.PRESENTED_IMAGE_CUSTOM = customEmptyImg;

export default Empty;
