import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pattern, Project, Yarn } from './types';

const STORAGE_KEY = 'yarnie:v1';

export interface State {
  projects: Project[];
  patterns: Pattern[];
  yarns: Yarn[];
  activeProjectId?: string; // project shown on the Counter tab
}

const initialState: State = { projects: [], patterns: [], yarns: [] };

type Collection = 'projects' | 'patterns' | 'yarns';
type ItemOf<C extends Collection> = State[C][number];

type Action =
  | { type: 'hydrate'; state: State }
  | { type: 'add'; collection: Collection; item: Project | Pattern | Yarn }
  | { type: 'update'; collection: Collection; id: string; changes: Partial<Project & Pattern & Yarn> }
  | { type: 'remove'; collection: Collection; id: string }
  | { type: 'setActiveProject'; id?: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...initialState, ...action.state };
    case 'add':
      return { ...state, [action.collection]: [action.item, ...state[action.collection]] };
    case 'update':
      return {
        ...state,
        [action.collection]: (state[action.collection] as any[]).map((it) =>
          it.id === action.id ? { ...it, ...action.changes } : it,
        ),
      };
    case 'remove': {
      const next = {
        ...state,
        [action.collection]: (state[action.collection] as any[]).filter((it) => it.id !== action.id),
      };
      if (action.collection === 'projects' && state.activeProjectId === action.id) {
        next.activeProjectId = undefined;
      }
      return next;
    }
    case 'setActiveProject':
      return { ...state, activeProjectId: action.id };
  }
}

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

interface StoreValue {
  state: State;
  ready: boolean;
  add: <C extends Collection>(collection: C, item: ItemOf<C>) => void;
  update: <C extends Collection>(collection: C, id: string, changes: Partial<ItemOf<C>>) => void;
  remove: (collection: Collection, id: string) => void;
  setActiveProject: (id?: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = React.useState(false);
  const hydrated = useRef(false);

  // Load saved data once on startup.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) dispatch({ type: 'hydrate', state: JSON.parse(raw) });
      })
      .catch((e) => console.warn('Yarnie: failed to load data', e))
      .finally(() => {
        hydrated.current = true;
        setReady(true);
      });
  }, []);

  // Save whenever data changes (after the initial load).
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.warn('Yarnie: failed to save data', e),
    );
  }, [state]);

  const value: StoreValue = {
    state,
    ready,
    add: (collection, item) => dispatch({ type: 'add', collection, item: item as any }),
    update: (collection, id, changes) => dispatch({ type: 'update', collection, id, changes: changes as any }),
    remove: (collection, id) => dispatch({ type: 'remove', collection, id }),
    setActiveProject: (id) => dispatch({ type: 'setActiveProject', id }),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
