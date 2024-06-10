import React from 'react';
import { withStyles } from '@mui/styles';
import {
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    Dialog,
} from '@mui/material';

import {
    Check as IconOk,
    Cancel as IconCancel,
} from '@mui/icons-material';

import SimpleCron from '../Components/SimpleCron';

import I18n from '../i18n';

// Generates cron expression

const styles: Record<string, any> = {
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
};

interface DialogCronProps {
    onClose: () => void;
    onOk: (cron: string) => void;
    title?: string;
    cron?: string;
    cancel?: string;
    ok?: string;
    classes: Record<string, string>;
}

interface DialogCronState {
    cron: string;
}

class DialogSimpleCron extends React.Component<DialogCronProps, DialogCronState> {
    constructor(props: DialogCronProps) {
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

    render() {
        return <Dialog
            onClose={() => {}}
            maxWidth="md"
            fullWidth
            classes={{ paper: this.props.classes.dialogPaper }}
            open={!0}
            aria-labelledby="cron-dialog-title"
        >
            <DialogTitle id="cron-dialog-title">{this.props.title || I18n.t('ra_Define CRON...')}</DialogTitle>
            <DialogContent style={{ height: '100%', overflow: 'hidden' }}>
                <SimpleCron
                    cronExpression={this.state.cron}
                    onChange={cron => this.setState({ cron })}
                    language={I18n.getLanguage()}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => this.handleOk()} color="primary" startIcon={<IconOk />}>{this.props.ok || I18n.t('ra_Ok')}</Button>
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

export default withStyles(styles)(DialogSimpleCron);
