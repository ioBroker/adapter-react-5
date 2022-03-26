import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';

import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Radio from '@mui/material/Radio';

import IconOk from '@mui/icons-material/Check';
import IconCancel from '@mui/icons-material/Cancel';

import ComplexCron from '../Components/ComplexCron';
import SimpleCron from '../Components/SimpleCron';
import Schedule from '../Components/Schedule';

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
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    }
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
                (typeof cron === 'object' || cron[0] === '{' ?
                    'wizard' :
                    (SimpleCron.cron2state(this.props.cron || '* * * * *') ? 'simple' : 'complex')))
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
        this.setState({mode});
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
                {(this.props.simple && this.props.complex) || (!this.props.simple && !this.props.complex) ? <div>
                    {!this.props.simple && !this.props.complex && <><Radio
                        key="wizard"
                        checked={this.state.mode === 'wizard'}
                        onChange={e => this.setMode('wizard')}
                    /><label onClick={e => this.setMode('wizard')}
                             style={this.state.mode !== 'wizard' ? {color: 'lightgrey'} : {}}>{I18n.t('sc_wizard')}</label></>}

                    {((!this.props.simple && !this.props.complex) || this.props.simple) && <><Radio
                        key="simple"
                        checked={this.state.mode === 'simple'}
                        onChange={e => this.setMode('simple')}
                    /><label onClick={e => this.setMode('simple')}
                             style={this.state.mode !== 'simple' ? {color: 'lightgrey'} : {}}>{I18n.t('sc_simple')}</label></>}

                    {((!this.props.simple && !this.props.complex) || this.props.complex) && <><Radio
                        key="complex"
                        checked={this.state.mode === 'complex'}
                        onChange={e => this.setMode('complex')}
                    /><label onClick={e => this.setMode('complex')} style={this.state.mode !== 'complex' ? {color: 'lightgrey'} : {}}>{I18n.t('sc_cron')}</label></>}
                </div> : null}

                {this.state.mode === 'simple' && <SimpleCron
                    cronExpression={this.state.cron}
                    onChange={cron => this.setState({cron})}
                    language={I18n.getLanguage()}
                />}
                {this.state.mode === 'wizard' && <Schedule
                    schedule={this.state.cron}
                    onChange={cron => this.setState({cron})}
                    language={I18n.getLanguage()}
                />}
                {this.state.mode === 'complex' && <ComplexCron
                    cronExpression={this.state.cron}
                    onChange={cron => this.setState({cron})}
                    language={I18n.getLanguage()}
                />}
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => this.handleOk()} color="primary"><IconOk className={this.props.classes.buttonIcon}/>{this.props.ok || I18n.t('ra_Ok')}</Button>
                <Button variant="contained" onClick={() => this.handleCancel()} color="grey"><IconCancel className={this.props.classes.buttonIcon}/>{this.props.cancel || I18n.t('ra_Cancel')}</Button>
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
    language: PropTypes.string
};

export default withStyles(styles)(DialogCron);
