// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';

import Utils from './Utils';

const styles = {
    root: {
        height: '100%',
        overflow: 'hidden',
    },
    overflowAuto: {
        overflow: 'auto',
    },
};

/**
 * @typedef {object} TabContentProps
 * @property {string} [overflow]
 * @property {{ [key in keyof styles]: string}} classes The styling class names.
 *
 * @extends {React.Component<TabContentProps>}
 */
class TabContent extends React.Component {
    render() {
        const { classes } = this.props;

        return <Grid
            item
            className={Utils.clsx(classes.root, { [classes.overflowAuto]: this.props.overflow === 'auto' })}
        >
            {this.props.children}
        </Grid>;
    }
}

TabContent.propTypes = {
    overflow: PropTypes.string,
};

/** @type {typeof TabContent} */
const _export = withStyles(styles)(TabContent);
export default _export;
