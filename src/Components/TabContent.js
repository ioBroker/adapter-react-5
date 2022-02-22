// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';
import withStyles from '@mui/styles/withStyles';

import PropTypes from 'prop-types';
import Utils from './Utils';

import Grid from '@mui/material/Grid';

const styles = {
    root: {
        height: '100%',
        overflow: 'hidden'
    },
    overflowAuto: {
        overflow: 'auto'
    }
};

/**
 * @typedef {object} TabContentProps
 * @property {string} [key] The key to identify this component.
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
            className={ Utils.clsx(classes.root, {[classes.overflowAuto]: this.props.overflow === 'auto'}) }
        >
            { this.props.children }
        </Grid>;
    }
}

TabContent.propTypes = {
    overflow: PropTypes.string
};

/** @type {typeof TabContent} */
const _export = withStyles(styles)(TabContent);
export default _export;