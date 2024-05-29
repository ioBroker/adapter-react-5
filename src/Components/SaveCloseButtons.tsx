// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import { withStyles } from '@mui/styles';

import { Fab, Toolbar } from '@mui/material';

import {
    Save as IconSave,
    Close as IconClose,
} from '@mui/icons-material';

import I18n from '../i18n';
import { IobTheme } from '../types';

const styles: Record<string, any> = {
    buttonIcon: {
        marginRight: 8,
    },
};

interface SaveCloseButtonsProps {
    /* Are the buttons without text */
    noTextOnButtons?: boolean;
    /* Theme object (from this.state.theme) */
    theme: IobTheme;
    /* bottom position 0 or 38 for iFrame */
    isIFrame?: boolean;
    /* is used in new React */
    newReact?: boolean;
    /* on Save handler */
    onSave: (close: boolean) => void;
    /* on Close handler */
    onClose: () => void;
    dense?: boolean;
    paddingLeft?: number;
    changed: boolean;
    error?: boolean;
    classes: Record<string, string>;
}

/**
 * @typedef {object} SaveCloseButtonsProps
 * @property {boolean} noTextOnButtons Are the buttons without text
 * @property {any} theme Theme object (from this.state.theme)
 * @property {boolean} isIFrame bottom position 0 or 38 for iFrame
 * @property {boolean} newReact is used in new react
 * @property {function} onSave on Save handler
 * @property {function} onClose on Close handler
 *
 * @extends {React.Component<SaveCloseButtonsProps>}
 */
class SaveCloseButtons extends React.Component<SaveCloseButtonsProps> {
    private isIFrame: boolean;
    /**
     * @param {SaveCloseButtonsProps} props
     */
    constructor(props: SaveCloseButtonsProps) {
        super(props);
        const newReact = props.newReact === undefined ? true : props.newReact;

        try {
            this.isIFrame = !newReact && window.self !== window.top;
        } catch (e) {
            this.isIFrame = !newReact;
        }
    }

    render() {
        const noTextOnButtons = this.props.noTextOnButtons;
        const buttonStyle: React.CSSProperties = {
            borderRadius: this.props.theme.saveToolbar.button.borderRadius || 3,
            height:       this.props.theme.saveToolbar.button.height       || 32,
        };

        const style: React.CSSProperties = {
            bottom: this.isIFrame ? 38 : 0,
            left: this.props.paddingLeft || 0,
            right: 0,
            position: 'absolute',
            background: this.props.theme.saveToolbar.background,
        };
        if (this.props.dense) {
            style.minHeight = 48;
        }

        if (this.props.error) {
            buttonStyle.border = '1px solid red';
        }

        return <Toolbar
            // position="absolute"
            style={style}
        >
            <Fab
                variant="extended"
                aria-label="Save"
                disabled={!this.props.changed || this.props.error}
                onClick={() => this.props.onSave(false)}
                style={buttonStyle}
            >
                <IconSave className={!noTextOnButtons ? this.props.classes.buttonIcon : ''} />
                {!noTextOnButtons && I18n.t('ra_Save')}
            </Fab>
            <Fab
                variant="extended"
                aria-label="Save and close"
                disabled={!this.props.changed || this.props.error}
                onClick={() => this.props.onSave(true)}
                style={{ ...buttonStyle, ...{ marginLeft: 10 } }}
            >
                <IconSave className={!noTextOnButtons ? this.props.classes.buttonIcon : ''} />
                {!noTextOnButtons ? I18n.t('ra_Save and close') : '+'}
                {noTextOnButtons && <IconClose />}
            </Fab>
            <div style={{ flexGrow: 1 }} />
            <Fab variant="extended" aria-label="Close" onClick={() => this.props.onClose()} style={buttonStyle}>
                <IconClose className={!noTextOnButtons ? this.props.classes.buttonIcon : ''} />
                {!noTextOnButtons && I18n.t('ra_Close')}
            </Fab>
        </Toolbar>;
    }
}

export default withStyles(styles)(SaveCloseButtons);
