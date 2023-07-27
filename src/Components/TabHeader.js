// please do not delete React, as without it other projects could not be compiled: ReferenceError: React is not defined
import React from 'react';

import { Grid } from '@mui/material';

/**
 * @typedef {object} TabHeaderProps
 *
 * @extends {React.Component<TabHeaderProps>}
 */
class TabHeader extends React.Component {
    render() {
        return <Grid
            item
            container
            alignItems="center"
        >
            {this.props.children}
        </Grid>;
    }
}

export default TabHeader;
