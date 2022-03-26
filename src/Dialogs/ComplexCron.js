import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';

import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';

import IconOk from '@mui/icons-material/Check';
import IconCancel from '@mui/icons-material/Cancel';
import IconClear from '@mui/icons-material/Delete';

import ComplexCron from '../Components/ComplexCron';

import I18n from '../i18n';

// Generate cron expression
const styles = theme => ({
    headerID: {
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
    radio: {
        display: 'inline-block'
    },
    dialogPaper: {
        height: 'calc(100% - 96px)'
    }
});

class DialogComplexCron extends React.Component {
    constructor(props) {
        super(props);
        let cron;
        if (this.props.cron && typeof this.props.cron === 'string' && this.props.cron.replace(/^["']/, '')[0] !== '{') {
            cron = this.props.cron.replace(/['"]/g, '').trim();
        } else {
            cron = this.props.cron || '{}';
            if (typeof cron === 'string') {
                cron = cron.replace(/^["']/, '').replace(/["']\n?$/, '');
            }
        }

        this.state =  {
            cron,
        };
    }

    handleCancel() {
        this.props.onClose();
    }

    handleOk() {
        this.props.onOk(this.state.cron);
        this.props.onClose();
    }

    handleClear() {
        this.props.onOk(false);
        this.props.onClose();
    }

    render() {
        return <Dialog
            onClose={() => {}}
            maxWidth="md"
            fullWidth={true}
            classes={{paper: this.props.classes.dialogPaper}}
            open={true}
            aria-labelledby="cron-dialog-title"
        >
            <DialogTitle id="cron-dialog-title">{this.props.title || I18n.t('ra_Define schedule...')}</DialogTitle>
            <DialogContent style={{height: '100%', overflow: 'hidden'}}>
                <ComplexCron
                    cronExpression={this.state.cron}
                    onChange={cron => this.setState({cron})}
                    language={I18n.getLanguage()}
                />
            </DialogContent>
            <DialogActions>
                {!!this.props.clearButton && <Button color="grey" variant="contained" onClick={() => this.handleClear()} startIcon={<IconClear />}>{this.props.clear || I18n.t('ra_Clear')}</Button>}
                <Button variant="contained" onClick={() => this.handleOk()} color="primary" startIcon={<IconOk />}>{this.props.ok || I18n.t('ra_Ok')}</Button>
                <Button color="grey" variant="contained" onClick={() => this.handleCancel()} startIcon={<IconCancel />}>{this.props.cancel || I18n.t('ra_Cancel')}</Button>
            </DialogActions>
        </Dialog>;
    }
}

DialogComplexCron.propTypes = {
    classes: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    title: PropTypes.string,
    cron: PropTypes.string,
    cancel: PropTypes.string,
    ok: PropTypes.string,
    simple: PropTypes.bool,
    language: PropTypes.string,
    clearButton: PropTypes.bool,
};

export default withStyles(styles)(DialogComplexCron);
