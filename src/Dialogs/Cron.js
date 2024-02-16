import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import {
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    Dialog,
    Radio,
} from '@mui/material';

import {
    Check as IconOk,
    Cancel as IconCancel,
} from '@mui/icons-material';

import ComplexCron from '../Components/ComplexCron';
import SimpleCron from '../Components/SimpleCron';
import Schedule from '../Components/Schedule';

import I18n from '../i18n';

// Generate cron expression

const styles = () => ({
    headerID: {
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    radio: {
        display: 'inline-block',
    },
    dialogPaper: {
        height: 'calc(100% - 96px)',
    },
});

class DialogCron extends React.Component {
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
            mode: this.props.simple ? 'simple' :
                (this.props.complex ? 'complex' :
                    ((typeof cron === 'object' || cron[0] === '{') && !this.props.noWizard ?
                        'wizard' :
                        (SimpleCron.cron2state(this.props.cron || '* * * * *') ? 'simple' : 'complex'))),
        };
    }

    handleCancel() {
        this.props.onClose();
    }

    handleOk() {
        this.props.onOk(this.state.cron);
        this.props.onClose();
    }

    setMode(mode) {
        this.setState({ mode });
    }

    render() {
        return <Dialog
            onClose={() => {}}
            maxWidth="md"
            fullWidth
            classes={{ paper: this.props.classes.dialogPaper }}
            open={!0}
            aria-labelledby="cron-dialog-title"
        >
            <DialogTitle id="cron-dialog-title">{this.props.title || I18n.t('ra_Define schedule...')}</DialogTitle>
            <DialogContent style={{ height: '100%', overflow: 'hidden' }}>
                {(this.props.simple && this.props.complex) || (!this.props.simple && !this.props.complex) ? <div>
                    {!this.props.simple && !this.props.complex && !this.props.noWizard && <>
                        <Radio
                            key="wizard"
                            checked={this.state.mode === 'wizard'}
                            onChange={() => this.setMode('wizard')}
                        />
                        <label
                            onClick={() => this.setMode('wizard')}
                            style={this.state.mode !== 'wizard' ? { color: 'lightgrey' } : {}}
                        >
                            {I18n.t('sc_wizard')}
                        </label>
                    </>}

                    {((!this.props.simple && !this.props.complex) || this.props.simple) && <>
                        <Radio
                            key="simple"
                            checked={this.state.mode === 'simple'}
                            onChange={() => this.setMode('simple')}
                        />
                        <label
                            onClick={() => this.setMode('simple')}
                            style={this.state.mode !== 'simple' ? { color: 'lightgrey' } : {}}
                        >
                            {I18n.t('sc_simple')}
                        </label>
                    </>}

                    {((!this.props.simple && !this.props.complex) || this.props.complex) && <>
                        <Radio
                            key="complex"
                            checked={this.state.mode === 'complex'}
                            onChange={() => this.setMode('complex')}
                        />
                        <label
                            onClick={() => this.setMode('complex')}
                            style={this.state.mode !== 'complex' ? { color: 'lightgrey' } : {}}
                        >
                            {I18n.t('sc_cron')}
                        </label>
                    </>}
                </div> : null}

                {this.state.mode === 'simple' && <SimpleCron
                    cronExpression={this.state.cron}
                    onChange={cron => this.setState({ cron })}
                    language={I18n.getLanguage()}
                />}
                {this.state.mode === 'wizard' && <Schedule
                    schedule={this.state.cron}
                    onChange={cron => this.setState({ cron })}
                    language={I18n.getLanguage()}
                />}
                {this.state.mode === 'complex' && <ComplexCron
                    cronExpression={this.state.cron}
                    onChange={cron => this.setState({ cron })}
                    language={I18n.getLanguage()}
                />}
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={() => this.handleOk()}
                    color="primary"
                    startIcon={<IconOk />}
                >
                    {this.props.ok || I18n.t('ra_Ok')}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => this.handleCancel()}
                    color="grey"
                    startIcon={<IconCancel />}
                >
                    {this.props.cancel || I18n.t('ra_Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

DialogCron.propTypes = {
    classes: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    title: PropTypes.string,
    cron: PropTypes.string,
    cancel: PropTypes.string,
    ok: PropTypes.string,
    simple: PropTypes.bool, // show only simple configuration
    complex: PropTypes.bool, // show only complex configuration
    noWizard: PropTypes.bool, // do not show wizard
};

export default withStyles(styles)(DialogCron);
