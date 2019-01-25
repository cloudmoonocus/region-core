import { setStore } from '../global/store';
import getActionTypes from '../util/getActionTypes';

export default () => {
  class Region {
    constructor(config) {
      this.private_setConfig({
        name: null,
        expiredTime: 0,
        enableLog: true,
        strictLoading: true,
      });
      if (config !== null && typeof config === 'object') {
        this.private_setConfig(config);
      } else {
        this.private_setConfig({ name: config });
      }
    }

    private_setConfig = (config = {}) => {
      const {
        name,
        reducerPath,
        expiredTime,
        enableLog,
        strictLoading,
        silentConnect,
        DefaultLoading,
        DefaultError,
      } = config;

      if (name !== undefined) {
        this.name = name;
        this.private_actionTypes = getActionTypes(name);
      }
      if (reducerPath !== undefined) {
        console.warn('reducerPath is deprecated, use name instead');
        this.name = reducerPath;
        this.private_actionTypes = getActionTypes(reducerPath);
      }
      if (expiredTime !== undefined) {
        this.expiredTime = expiredTime;
      }
      if (enableLog !== undefined) {
        this.enableLog = enableLog;
      }
      if (strictLoading !== undefined) {
        this.strictLoading = strictLoading;
      }
      if (silentConnect !== undefined) {
        console.warn('silentConnect is deprecated, set {DefaultLoading: () => null} instead');
        this.silentConnect = silentConnect;
        this.DefaultLoading = silentConnect ? () => null : undefined;
      }
      if (DefaultLoading !== undefined) {
        this.DefaultLoading = DefaultLoading;
      }
      if (DefaultError !== undefined) {
        this.DefaultError = DefaultError;
      }
    }

    setConfig = (config = {}) => {
      console.warn('setConfig is deprecated, use private_setConfig instead');
      const { private_setConfig } = this;
      const { store } = config;

      if (store !== undefined) {
        console.warn('setStore in setConfig is deprecated, use getProvider or setStore instead');
        setStore(store);
      }
      private_setConfig(config);
    }
  }
  return Region;
};