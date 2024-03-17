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
    Delete as IconClear,
} from '@mui/icons-material';

import ComplexCron from '../Components/ComplexCron';

import I18n from '../i18n';

// Generate cron expression
const styles: Record<string, any> ={
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
    onOk: (cron: string | false) => void;
    title?: string;
    cron?: string;
    cancel?: string;
    ok?: string;
    clear?: string;
    classes: Record<string, string>;
    clearButton?: boolean;
}

interface DialogCronState {
    cron: string;
}

class DialogComplexCron extends React.Component<DialogCronProps, DialogCronState> {
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

    handleClear() {
        this.props.onOk(false);
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
            <DialogTitle id="cron-dialog-title">{this.props.title || I18n.t('ra_Define schedule...')}</DialogTitle>
            <DialogContent style={{ height: '100%', overflow: 'hidden' }}>
                <ComplexCron
                    cronExpression={this.state.cron}
                    onChange={cron => this.setState({ cron })}
                    language={I18n.getLanguage()}
                />
            </DialogContent>
            <DialogActions>
                {!!this.props.clearButton && <Button
                    // @ts-expect-error
                    color="grey"
                    variant="contained"
                    onClick={() => this.handleClear()}
                    startIcon={<IconClear />}
                >
                    {this.props.clear || I18n.t('ra_Clear')}
                </Button>}
                <Button
                    variant="contained"
                    onClick={() => this.handleOk()}
                    color="primary"
                    startIcon={<IconOk />}
                >
                    {this.props.ok || I18n.t('ra_Ok')}
                </Button>
                <Button
                    // @ts-expect-error
                    color="grey"
                    variant="contained"
                    onClick={() => this.handleCancel()}
                    startIcon={<IconCancel />}
                >
                    {this.props.cancel || I18n.t('ra_Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

export default withStyles(styles)(DialogComplexCron);
