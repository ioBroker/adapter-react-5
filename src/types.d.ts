import { Theme as MuiTheme } from '@mui/material/styles';
import LegacyConnection from './LegacyConnection';
import { AdminConnection, Connection } from '@iobroker/socket-client';

export type Translator = (key: string, ...args: any[]) => string;

export interface ConnectionProps {
    /** The socket name. */
    name?: string;
    /** State IDs to always automatically subscribe to. */
    autoSubscribes?: string[];
    /** Automatically subscribe to logging. */
    autoSubscribeLog?: boolean;
    /** The protocol to use for the socket.io connection. */
    protocol?: string;
    /** The host name to use for the socket.io connection. */
    host?: string;
    /** The port to use for the socket.io connection. */
    port?: string | number;
    /** The socket.io connection timeout. */
    ioTimeout?: number;
    /** Flag to indicate if all objects should be loaded or not. Default true (not loaded) */
    doNotLoadAllObjects?: boolean;
    /** Flag to indicate if AccessControlList for current user will be loaded or not. Default true (not loaded) */
    doNotLoadACL?: boolean;
    /** Progress callback. */
    onProgress?: (progress: number) => void;
    /** Ready callback. */
    onReady?: (objects: Record<string, ioBroker.Object>) => void;
    /** Log callback. */
    onLog?: (text: string) => void;
    /** Error callback. */
    onError?: (error: any) => void;
    /** Object change callback. */
    onObjectChange?: ioBroker.ObjectChangeHandler;
    /** Language callback */
    onLanguage?: (lang: ioBroker.Languages) => void;
}

export interface OldObject {
    _id: string;
    type: string;
}

export type ObjectChangeHandler = (id: string, obj: ioBroker.Object | null | undefined, oldObj: OldObject) => void | Promise<void>;

export interface GenericAppProps {
    /** Adapter instance number if known, else will be determined from url */
    instance?: number;
    /** The name of the adapter. */
    adapterName?: string;
    /** Should the bottom buttons be shown (default: true). */
    bottomButtons?: boolean;
    /** Additional translations. */
    translations?: { [lang in ioBroker.Languages]?: Record<string, string>; };
    /** Fields that should be encrypted/decrypted. */
    encryptedFields?: string[];
    /** Socket.io configuration. */
    socket?: ConnectionProps;
    /** Desired connection object */
    Connection?: LegacyConnection | Connection | AdminConnection;
}

export interface GenericAppSettings extends GenericAppProps {
    /** Don't load all objects on start-up. */
    doNotLoadAllObjects?: boolean;
}

export type ThemeName = 'dark' | 'light' | 'colored' | 'blue' | 'PT' | 'DX';
export type ThemeType = 'dark' | 'light';

export interface GenericAppState {
    selectedTab: string;
    selectedTabNum: number;
    native: ioBroker.AdapterConfig;
    errorText: string | JSX.Element;
    changed: boolean;
    connected: boolean;
    loaded: boolean;
    isConfigurationError: string;
    toast: string;
    theme: Theme;
    themeName: ThemeName;
    themeType: ThemeType;
    bottomButtons: boolean;
    width: Width;
}

export type Width = 'xs' | 'sm' | 'md' | 'lg' | 'xl';


export interface Theme extends MuiTheme {
    name: ThemeName;
}
