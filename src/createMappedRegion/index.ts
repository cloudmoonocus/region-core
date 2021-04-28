import { useMemo } from 'react';
import { useSubscription } from 'use-subscription';
import * as jsonStableStringify from 'json-stable-stringify';
import { deprecate, isAsync } from '../util';
import {
  ResultFunc,
  ResultFuncPure,
  AsyncFunctionOrPromise,
  LoadOption,
  OptionOrReducer,
  AsyncFunction,
  Strategy,
  RegionOption,
  Listener,
  Props,
  LoadPayload,
  Payload,
} from '../types';

const increase = (v: number = 0) => v + 1;
const decrease = (v: number = 0) => v - 1 > 0 ? v - 1 : 0;

interface ToPromiseParams<TParams, V> {
  asyncFunction: AsyncFunctionOrPromise<TParams, V>;
  params: any;
}

const toPromise = async <TParams, V>({ asyncFunction, params }: ToPromiseParams<TParams, V>) => {
  if (typeof asyncFunction === 'function') {
    return (asyncFunction as AsyncFunction<TParams, V>)(params);
  }
  // promise
  return asyncFunction;
};

const formatLoading = (loading?: number) => {
  // treat undefined as true
  if (loading === undefined) {
    return true;
  }
  return loading > 0;
};

const formatError = (error?: unknown): Error => {
  return typeof error === 'string' ? new Error(error) : (error as Error);
};

const getCombinedOption = <TParams, TResult, V>(
  optionOrReducer: OptionOrReducer<TParams, TResult, V> = {},
  exOption?: LoadOption<TParams, TResult, V>,
): LoadOption<TParams, TResult, V> => {
  if (typeof optionOrReducer === 'function') {
    if (exOption) {
      return { reducer: optionOrReducer, ...exOption };
    }
    return { reducer: optionOrReducer };
  }
  return optionOrReducer;
};

const getSetResult = <V>(resultOrFunc: V | ResultFuncPure<V>, snapshot: V) => {
  if (typeof resultOrFunc === 'function') {
    return (resultOrFunc as ResultFuncPure<V>)(snapshot);
  }
  return resultOrFunc;
};

export interface CreateMappedRegionReturnValue<K, V> {
  private_getState_just_for_test: () => any;
  private_setState_just_for_test: (value: any) => void;
  set: (key: K, resultOrFunc: V | ResultFunc<V>) => V;
  reset: (key: K) => void;
  resetAll: () => void;
  // emit: (key: K) => void;
  // emitAll: () => void;
  load: <TParams = void, TResult = unknown>(
    key: K | ((params: TParams) => K),
    asyncFunction: AsyncFunctionOrPromise<TParams, TResult>,
    optionOrReducer?: OptionOrReducer<TParams, TResult, V>,
    exOption?: LoadOption<TParams, TResult, V>,
  ) => Promise<V | void>;
  loadBy: <TParams = void, TResult = unknown>(
    key: K | ((params: TParams) => K),
    asyncFunction: AsyncFunctionOrPromise<TParams, TResult>,
    optionOrReducer?: OptionOrReducer<TParams, TResult, V>,
    exOption?: LoadOption<TParams, TResult, V>,
  ) => (params: TParams) => Promise<V | void>;
  getValue: (key: K) => V | undefined;
  getLoading: (key: K) => boolean;
  getError: (key: K) => Error | undefined;
  getFetchTime: (key: K) => number | undefined;
  getReducedValue: <TParams extends K | K[], TResult extends any>(
    params: TParams,
    reducer: (state: {[key: string]: Props<V>}, params: TParams) => TResult,
  ) => TResult;
  useValue: (key: K) => V | undefined;
  useLoading: (key: K) => boolean;
  useError: (key: K) => Error | undefined;
  useFetchTime: (key: K) => number | undefined;
  useReducedValue: <TParams extends K | K[], TResult extends any>(
    params: TParams,
    reducer: (state: {[key: string]: Props<V>}, params: TParams) => TResult,
  ) => TResult;
}

export interface CreateMappedRegionPureReturnValue<K, V>
  extends Omit<CreateMappedRegionReturnValue<K, V>, 'set' | 'load' | 'loadBy' | 'getValue' | 'useValue'> {
  set: (key: K, resultOrFunc: V | ResultFuncPure<V>) => V;
  load: <TParams = void, TResult = unknown>(
    key: K | ((params: TParams) => K),
    asyncFunction: AsyncFunctionOrPromise<TParams, TResult>,
    optionOrReducer?: OptionOrReducer<TParams, TResult, V>,
    exOption?: LoadOption<TParams, TResult, V>,
  ) => Promise<V>;
  loadBy: <TParams = void, TResult = unknown>(
    key: K | ((params: TParams) => K),
    asyncFunction: AsyncFunctionOrPromise<TParams, TResult>,
    optionOrReducer?: OptionOrReducer<TParams, TResult, V>,
    exOption?: LoadOption<TParams, TResult, V>,
  ) => (params: TParams) => Promise<V>;
  getValue: (key: K) => V;
  useValue: (key: K) => V;
}

// overload is unsafe in some way, ensure the return type is correct
function createMappedRegion <K, V>(initialValue: void | undefined, option?: RegionOption): CreateMappedRegionReturnValue<K, V>;
function createMappedRegion <K, V>(initialValue: V, option?: RegionOption): CreateMappedRegionPureReturnValue<K, V>;
// tslint:disable-next-line:max-line-length
function createMappedRegion <K, V>(initialValue: V | void | undefined, option?: RegionOption): CreateMappedRegionReturnValue<K, V> | CreateMappedRegionPureReturnValue<K, V> {
  // ---- Utils ----
  type Result = CreateMappedRegionPureReturnValue<K, V>;

  const strategy: Strategy = option?.strategy ?? 'acceptLatest';

  // const private_store = createStore<V>();

  /* -------- */
  interface PrivateStoreState {
    [key: string]: Props<V>;
  }
  let state: PrivateStoreState = {};
  const listeners: Listener[] = [];

  const private_store_ensure = (key: string): void => {
    if (!state[key]) {
      state[key] = {};
    }
  };

  const private_store_emit = (key: string): void => {
    const props = state[key];
    if (!props) {
      return;
    }
    const { listeners } = props;
    if (!listeners) {
      return;
    }
    listeners.forEach(listener => listener());
  };

  const private_store_emitAll = (): void => {
    listeners.forEach(listener => listener());
  };

  // only used for test
  const private_store_getState = (): PrivateStoreState => {
    return state;
  };

  // only used for test
  const private_store_setState = (value: PrivateStoreState): void => {
    state = value;
  };

  const private_store_getAttribute = <A extends keyof Props<V>>(key: string, attribute: A): Props<V>[A] => {
    const props = state[key];
    if (!props) {
      return undefined;
    }
    return props[attribute];
  };

  const private_store_load = <TResult>(key: string, promise: Promise<TResult>): void => {
    private_store_ensure(key);

    // since it is ensured
    const props = state[key] as Props<V>;

    props.promise = promise;
    props.pendingMutex = increase(props.pendingMutex);
    private_store_emit(key);
  };

  const private_store_loadEnd = (key: string): void => {
    private_store_ensure(key);

    // since it is ensured
    const props = state[key] as Props<V>;

    props.pendingMutex = decrease(props.pendingMutex);
    private_store_emit(key);
  };

  const private_store_set = (key: string, value: V): void => {
    private_store_ensure(key);

    // since it is ensured
    const props = state[key] as Props<V>;

    const snapshot = props.value;
    const formatValue = typeof value === 'function' ? value(snapshot) : value;
    props.pendingMutex = decrease(props.pendingMutex);
    const fetchTime = new Date().getTime();
    props.fetchTime = fetchTime;
    props.value = formatValue;
    props.error = undefined; // reset error

    private_store_emit(key);
  };

  const private_store_setError = (key: string, error: unknown): void => {
    private_store_ensure(key);

    // since it is ensured
    const props = state[key] as Props<V>;

    props.pendingMutex = decrease(props.pendingMutex);
    props.error = error;

    if (error) {
      console.error(error);
    }
    private_store_emit(key);
  };

  const private_store_reset = (key: string): void => {
    delete state[key];
    private_store_emit(key);
  };

  const private_store_resetAll = (): void => {
    state = {};
    private_store_emitAll();
  };

  const private_store_subscribe = (key: string, listener: Listener): () => void => {
    private_store_ensure(key);

    // since it is ensured
    const props = state[key] as Props<V>;

    if (!props.listeners) {
      props.listeners = [];
    }

    props.listeners.push(listener);
    return () => {
      if (!props.listeners) {
        props.listeners = [];
      }
      props.listeners.splice(listeners.indexOf(listener), 1);
    };
  };

  const private_store_subscribeAll = (listener: Listener): () => void => {
    listeners.push(listener);
    return () => {
      listeners.splice(listeners.indexOf(listener), 1);
    };
  };
  /* -------- */

  const getKeyString = (key: K | K[]): string => {
    if (typeof key === 'string') {
      return key;
    }
    return jsonStableStringify(key);
  };

  const getValueOrInitialValue = (value: V | undefined): V => {
    if (value !== undefined) {
      return value;
    }
    return initialValue as V;
  };

  // ---- APIs ----
  const set: Result['set'] = (key, resultOrFunc) => {
    const keyString = getKeyString(key);
    // Maybe we can use getValue here
    const maybeSnapshot = private_store_getAttribute(keyString, 'value');
    const snapshot = getValueOrInitialValue(maybeSnapshot);
    const result = getSetResult(resultOrFunc, snapshot);
    private_store_set(keyString, result);
    return result;
  };

  const reset: Result['reset'] = (key: K) => {
    if (key === undefined) {
      deprecate('reset should be called with key, use resetAll to reset all keys');
      private_store_resetAll();
    }
    const keyString = getKeyString(key);
    private_store_reset(keyString);
  };

  const resetAll: Result['resetAll'] = private_store_resetAll;

  // const emit: Result['emit'] = (key: K) => {
  //   const keyString = getKeyString(key);
  //   private_store_emit(keyString);
  // };
  //
  // const emitAll: Result['emitAll'] = private_store_emitAll;

  const load: Result['load'] = async (
    key,
    asyncFunction,
    optionOrReducer,
    exOption,
  ) => {
    const option = getCombinedOption(optionOrReducer, exOption);
    if (!isAsync(asyncFunction)) {
      console.warn('set result directly');
      const setKey = typeof key === 'function' ? (key as Function)(option.params) : key;
      return set(setKey, asyncFunction as unknown as any);
    }
    // @ts-ignore
    const params = option.params as TParams;
    return loadBy(key, asyncFunction, option)(params);
  };

  const loadBy: Result['loadBy'] = (
    key,
    asyncFunction,
    optionOrReducer,
    exOption,
  ) => {
    const option = getCombinedOption(optionOrReducer, exOption);

    return async (params) => {
      const loadKey = typeof key === 'function' ? (key as Function)(params) : key;
      const keyString = getKeyString(loadKey);
      const promise = toPromise({ asyncFunction, params });
      private_store_load(keyString, promise);
      /**
       * note
       * 1. always get value after await, so it is the current one
       * 2. ensure if initialValue is gaven, every branch should return initialValueOfKey as T[K]
       */
      try {
        const result = await promise;
        const currentPromise = private_store_getAttribute(keyString, 'promise');
        const snapshot = private_store_getAttribute(keyString, 'value');

        const formattedResult = typeof option.reducer === 'function'
          ? option.reducer(getValueOrInitialValue(snapshot), result, params)
          : result as unknown as V;
        if (strategy === 'acceptLatest' && promise !== currentPromise) {
          // decrease loading & return snapshot
          private_store_loadEnd(keyString);
          return getValueOrInitialValue(snapshot);
        }
        private_store_set(keyString, formattedResult);
        return getValueOrInitialValue(formattedResult);
      } catch (error) {
        const currentPromise = private_store_getAttribute(keyString, 'promise');
        const snapshot = private_store_getAttribute(keyString, 'value');

        if (strategy === 'acceptLatest' && promise !== currentPromise) {
          // decrease loading & return snapshot
          private_store_loadEnd(keyString);
          return getValueOrInitialValue(snapshot);
        }
        private_store_setError(keyString, error);
        return getValueOrInitialValue(snapshot);
      }
    };
  };

  const getValue: Result['getValue'] = (key) => {
    const keyString = getKeyString(key);
    const value = private_store_getAttribute(keyString, 'value');
    return getValueOrInitialValue(value);
  };

  const getLoading: Result['getLoading'] = (key) => {
    const keyString = getKeyString(key);
    return formatLoading(private_store_getAttribute(keyString, 'pendingMutex'));
  };

  const getError: Result['getError'] = (key) => {
    const keyString = getKeyString(key);
    return formatError(private_store_getAttribute(keyString, 'error'));
  };

  const getFetchTime: Result['getFetchTime'] = (key) => {
    const keyString = getKeyString(key);
    return private_store_getAttribute(keyString, 'fetchTime');
  };

  const getReducedValue: Result['getReducedValue'] = (params, reducer) => {
    return reducer(state, params);
  };

  const createHooks = <TReturnType>(getFn: (key: K) => TReturnType) => {
    return (key: K): TReturnType => {
      const subscription = useMemo(
        () => ({
          getCurrentValue: () => getFn(key),
          subscribe: (listener: Listener) => private_store_subscribe(getKeyString(key), listener),
        }),
        // shallow-equal
        [getFn, getKeyString(key)],
      );
      return useSubscription(subscription);
    };
  };

  const useValue: Result['getValue'] = createHooks(getValue);

  const useLoading: Result['getLoading'] = createHooks(getLoading);

  const useError: Result['getError'] = createHooks(getError);

  const useFetchTime: Result['getFetchTime'] = createHooks(getFetchTime);

  const useReducedValue: Result['useReducedValue'] = (params, reducer) => {
    const subscription = useMemo(
      () => ({
        getCurrentValue: () => reducer(state, params),
        subscribe: private_store_subscribeAll,
      }),
      // shallow-equal
      [reducer, getKeyString(params)],
    );
    return useSubscription(subscription);
  };

  return {
    private_getState_just_for_test: private_store_getState,
    private_setState_just_for_test: private_store_setState,
    set,
    reset,
    resetAll,
    // emit,
    // emitAll,
    load,
    loadBy,
    getValue,
    getLoading,
    getError,
    getFetchTime,
    getReducedValue,
    useValue,
    useLoading,
    useError,
    useFetchTime,
    useReducedValue,
  };
}

// tslint:disable-next-line:max-file-line-count
export default createMappedRegion;
