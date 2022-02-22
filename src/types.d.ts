import {Theme as MuiTheme} from "@mui/material/styles";

export type Translator = (key: string, arg1?: any, arg2?: any, arg3?: any) => string;

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
}

export interface GenericAppSettings extends GenericAppProps {
    /** Don't load all objects on start-up. */
    doNotLoadAllObjects?: boolean;
}

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
    themeName: string;
    themeType: string;
    bottomButtons: boolean;
    width: Width;
}

export type Width = ('xs' | 'sm' | 'md' | 'lg' | 'xl');

export interface Theme extends MuiTheme {
    name: string;
}
