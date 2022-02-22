import { Translator, Width } from '../types';
import Connection from '../Connection';
import Router from './Router';

export interface FileBrowserProps {
    /** The key to identify this component. */
    key?: string;
    /** Additional styling for this component. */
    style?: React.CSSProperties;
    /** The CSS class name. */
    className?: string;
    /** Translation function. */
    t: Translator;
    /** The selected language. */
    lang: ioBroker.Languages;
    /** The socket connection. */
    socket: Connection;
    /** Is the component data ready. */
    ready?: boolean;
    /** Is expert mode enabled? (default: false) */
    expertMode?: boolean;
    /** Show the toolbar? (default: false) */
    showToolbar?: boolean;
    /** Allow upload of new files? (default: false) */
    allowUpload?: boolean;
    /** Allow download of files? (default: false) */
    allowDownload?: boolean;
    /** Allow creation of new folders? (default: false) */
    allowCreateFolder?: boolean;
    /** Allow deleting files? (default: false) */
    allowDelete?: boolean;
    /** Allow viewing files? (default: false) */
    allowView?: boolean;
    /** Prefix (default: '.') */
    imagePrefix?: string;
    /** Show the expert button? */
    showExpertButton?: boolean;
    /** Type of view */
    viewType?: 'Table' | 'Tile';
    /** Show the buttons to switch the view from table to tile? (default: false) */
    showViewTypeButton?: boolean;
    /** The ID of the selected file. */
    selected?: string;
    /** The file extensions to show, like ['png', 'svg', 'bmp', 'jpg', 'jpeg']. */
    filterFiles?: string[];
    /** The file extension categories to show. */
    filterByType?: 'images' | 'code' | 'txt';
    /** Callback for file selection. */
    onSelect?: (id: string, isDoubleClick?: boolean) => void;
}

export interface ObjectBrowserTableFilter {
    id?: string;
    name?: string;
    room?: string;
    func?: string;
    role?: string;
    expertMode?: boolean;
}

export type ObjectBrowserColumn = 'name' | 'type' | 'role' | 'room' | 'func' | 'val' | 'buttons';

export interface ObjectBrowserCustomFilter {
    type: string;
    common: { custom: string | boolean; };
}

export type ObjectBrowserType = 'state' | 'instance' | 'channel';

export interface ObjectBrowserProps {
    /** The title of the dialog. */
    title: string;
    /** The key to store state in the browser (default: 'App') */
    key?: string;
    /** The CSS classes. */
    classes: Record<string, any>;
    /** Default filters to be applied to the object table. */
    defaultFilters?: ObjectBrowserTableFilter;
    /** The selected ID or IDs. */
    selected?: string | string[];
    /** Callback when object is selected. */
    onSelect?: (selectedItems: string[], name: string, isDouble?: boolean) => void;
    /** The socket connection. */
    socket: Connection;
    /** Show the expert button? */
    showExpertButton?: boolean;
    /** Is expert mode enabled? (default: false) */
    expertMode?: boolean;
    /** Prefix (default: '.') */
    imagePrefix?: string;
    /** Theme name. */
    themeName?: string;
    /** Translation function. */
    t: Translator;
    /** The selected language. */
    lang: ioBroker.Languages;
    /** Allow to select multiple objects? (default: false) */
    multiSelect?: boolean;
    /** Can't objects be edited? (default: false) */
    notEditable?: boolean;
    /** Show folders first? (default: false) */
    foldersFirst?: boolean;
    /** Disable the column selector? (default: false) */
    disableColumnSelector?: boolean;
    /** The custom dialog React component to use */
    objectCustomDialog?: any;
    /** Custom filter. Optional {common: {custom: true}} or {common: {custom: 'sql.0'}} */
    customFilter?: ObjectBrowserCustomFilter;
    /** Custom value React component to use */
    objectBrowserValue?: any;
    /** Custom object editor React component to use */
    objectBrowserEditObject?: any;
    /** Router */
    router?: Router<{}, {}>;
    /** Object types to show */
    types?: ObjectBrowserType[];
    /** Columns to display */
    columns?: ObjectBrowserColumn[];
    /** The width of the dialog. */
    width?: Width;
}
