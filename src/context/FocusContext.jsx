import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const FocusContext = createContext(null);

export function FocusProvider({ children }) {
  const { user } = useAuth();
  const [score, setScore] = useState(null);
  const [state, setState] = useState(null);
  const [focusActive, setFocusActive] = useState(true);
  const [residueMinutes, setResidueMinutes] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // fetch live score immediately
    api.getLiveScore(user.accessToken)
      .then(data => {
        setScore(data.score);
        setState(data.state);
        setLastUpdated(data.timestamp);
      })
      .catch(console.error);

    // subscribe to realtime
    const channel = supabase.channel(`focus-${user.userId}`)
      .on('broadcast', { event: 'focus_score_update' }, ({ payload }) => {
        setScore(payload.score);
        setState(payload.state);
        setLastUpdated(payload.timestamp);
      })
      .on('broadcast', { event: 'focus_active_change' }, ({ payload }) => {
        setFocusActive(payload.focus_active);
        setScore(payload.score);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <FocusContext.Provider value={{ score, state, focusActive, residueMinutes, lastUpdated, setResidueMinutes }}>
      {children}
    </FocusContext.Provider>
  );
}

export const useFocus = () => useContext(FocusContext);
