import React from 'react';
import SVG from 'react-inlinesvg';

import {
    SettingsApplications as IconSystem,
    Photo as IconPhoto,
    SupervisedUserCircle as IconGroup,
    PersonOutlined as IconUser,
    Router as IconHost,
    Wifi as IconConnection,
    Info as IconInfo,
    Description as IconMeta,
} from '@mui/icons-material';

import IconAlias from '../icons/IconAlias';
import Utils from './Utils';

export function getSystemIcon(obj: ioBroker.Object | null): React.JSX.Element | null {
    let icon;
    const id = obj?._id;

    if (!id) {
        return null;
    }

    // system or design has special icons
    if (id.startsWith('_design/') || (id === 'system')) {
        icon = <IconSystem className="iconOwn" />;
    } else if (id === '0_userdata' || id === '0_userdata.0') {
        icon = <IconPhoto className="iconOwn" />;
    } else if (id === 'alias' || id === 'alias.0') {
        icon = <IconAlias className="iconOwn" />;
    } else if (id === 'system.adapter') {
        icon = <IconSystem className="iconOwn" />;
    } else if (id === 'system.group') {
        icon = <IconGroup className="iconOwn" />;
    } else if (id === 'system.user') {
        icon = <IconUser className="iconOwn" />;
    } else if (id === 'system.host') {
        icon = <IconHost className="iconOwn" />;
    } else if (id.endsWith('.connection') || id.endsWith('.connected')) {
        icon = <IconConnection className="iconOwn" />;
    } else if (id.endsWith('.info')) {
        icon = <IconInfo className="iconOwn" />;
    } else if (obj?.type === 'meta') {
        icon = <IconMeta className="iconOwn" />;
    }

    return icon || null;
}

export function getSelectIdIcon(obj: ioBroker.Object | null, imagePrefix?: string): string | null {
    imagePrefix = imagePrefix || '.'; // http://localhost:8081';
    let src = '';
    const common = obj?.common;

    if (common) {
        const cIcon = common.icon;
        if (cIcon) {
            if (!cIcon.startsWith('data:image/')) {
                if (cIcon.includes('.')) {
                    let instance;
                    if (obj.type === 'instance' || obj.type === 'adapter') {
                        src = `${imagePrefix}/adapter/${common.name}/${cIcon}`;
                    } else if (obj._id && obj._id.startsWith('system.adapter.')) {
                        instance = obj._id.split('.', 3);
                        if (cIcon[0] === '/') {
                            instance[2] += cIcon;
                        } else {
                            instance[2] += `/${cIcon}`;
                        }
                        src = `${imagePrefix}/adapter/${instance[2]}`;
                    } else {
                        instance = obj._id.split('.', 2);
                        if (cIcon[0] === '/') {
                            instance[0] += cIcon;
                        } else {
                            instance[0] += `/${cIcon}`;
                        }
                        src = `${imagePrefix}/adapter/${instance[0]}`;
                    }
                } else {
                    return null;
                }
            } else {
                // base 64 image
                src = cIcon;
            }
        }
    }

    return src || null;
}

interface IconProps {
    /** URL, UTF-8 character, or svg code (data:image/svg...) */
    src: string | React.JSX.Element | null | undefined;
    /** Class name */
    className?: string;
    /** Style for image */
    style?: React.CSSProperties;
    /** Tooltip */
    title?: string;
    /** Styles for utf-8 characters */
    styleUTF8?: React.CSSProperties;
    /** Alternative text for image */
    alt?: string;
}

const Icon = (props: IconProps) => {
    if (props.src) {
        if (typeof props.src === 'string') {
            if (props.src.length < 3) {
                // utf-8 char
                return <span
                    title={props.title || undefined}
                    style={{ height: 27, marginTop: -8, ...(props.styleUTF8 || props.style) }}
                    className={Utils.clsx(props.className, 'iconOwn')}
                >
                    {props.src}
                </span>;
            }
            if (props.src.startsWith('data:image/svg')) {
                return <SVG
                    title={props.title || undefined}
                    src={props.src}
                    className={Utils.clsx(props.className, 'iconOwn')}
                    width={props.style?.width || 28}
                    height={props.style?.height || props.style?.width || 28}
                    style={props.style || {}}
                />;
            }
            return <img
                title={props.title || undefined}
                style={props.style || {}}
                className={Utils.clsx(props.className, 'iconOwn')}
                src={props.src}
                alt={props.alt || undefined}
            />;
        }

        return props.src;
    }
    return null;
}

export default Icon;
