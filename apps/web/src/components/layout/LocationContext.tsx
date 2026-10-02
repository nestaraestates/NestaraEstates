'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';

export type LocationState = {
  city: string;
  lat: number | null;
  lng: number | null;
};

type LocationContextType = {
  location: LocationState;
  setLocation: (loc: LocationState) => void;
  isLocating: boolean;
};

const defaultLocation: LocationState = {
  city: 'Anywhere',
  lat: null,
  lng: null,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<LocationState>(defaultLocation);
  const [isLocating, setIsLocating] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const initLocation = async () => {
      // 1. Check local storage
      const saved = localStorage.getItem('user_location');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLocationState(parsed);
        } catch (e) {}
      }

      // 2. Fetch from DB if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferred_cities')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.preferred_cities && profile.preferred_cities.length > 0) {
          // If we have a preferred city but no lat/lng, we could geocode, 
          // or just set the city and let user set lat/lng later
          // For simplicity, we just sync if there's a difference.
          const prefCity = profile.preferred_cities[0];
          setLocationState((prev) => {
            if (prev.city !== prefCity) {
              const newLoc = { city: prefCity, lat: null, lng: null };
              localStorage.setItem('user_location', JSON.stringify(newLoc));
              return newLoc;
            }
            return prev;
          });
        }
      }
      setIsLocating(false);
    };

    initLocation();
  }, [supabase]);

  const setLocation = async (loc: LocationState) => {
    setLocationState(loc);
    localStorage.setItem('user_location', JSON.stringify(loc));
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ preferred_cities: [loc.city] })
        .eq('id', session.user.id);
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, isLocating }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
