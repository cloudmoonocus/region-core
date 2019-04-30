import RegionPrivate from './RegionPrivate';
import { Props, Key, GetDerivedStateFromProps, LoadOption } from '../types';
declare class RegionPublic extends RegionPrivate {
    /**
     * @param key string
     * @param result any
     * @param option
     * @param option.format (result, snapshot) => any
     */
    set: (key: string, result: any, option?: LoadOption) => any;
    /**
     * @param key string
     * @param option
     * @param option.format (result, snapshot) => any | A function format result to other data structure
     */
    setBy: (key: string, option?: LoadOption) => (result: any) => any;
    reset: () => void;
    load: (key: string, asyncFunction: any, option?: LoadOption) => Promise<any>;
    /**
     * @param option.params asyncFunction may need
     * @param option.format A function format result to other data structure
     * @param option.forceUpdate true | false
     */
    loadBy: (key: string, asyncFunction: any, option?: LoadOption) => (params: any) => Promise<any>;
    getProps: (key: Key) => Props;
    unstable_effect: (from: Key, to: string, getDerivedStateFromProps: GetDerivedStateFromProps) => void;
}
export default RegionPublic;
