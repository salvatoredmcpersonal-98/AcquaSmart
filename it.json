import { useState, useEffect } from 'react';

// --- PSEUDOCODE / LOGIC DESCRIPTION ---
// function checkTrialStatus(userCreatedAt) {
//   const REGISTRATION_DATE = new Date(userCreatedAt);
//   const CURRENT_DATE = new Date();
//   const TRIAL_DURATION_DAYS = 21;
//
//   const daysSinceRegistration = (CURRENT_DATE - REGISTRATION_DATE) / (1000 * 60 * 60 * 24);
//
//   if (daysSinceRegistration > TRIAL_DURATION_DAYS) {
//     return { isActive: false, isReadOnly: true, daysRemaining: 0 };
//   }
//
//   const daysRemaining = Math.ceil(TRIAL_DURATION_DAYS - daysSinceRegistration);
//
//   if (daysRemaining === 1) {
//     // Trigger push notification: "Your trial expires tomorrow..."
//     // This should be handled by a backend service triggered by a cron job for reliability.
//     console.log('PUSH NOTIFICATION: Trial expires tomorrow!');
//   }
//
//   return { isActive: true, isReadOnly: false, daysRemaining };
// }

// --- REACT HOOK IMPLEMENTATION ---

// Mock user creation date. In a real app, this would come from the user object after login.
const MOCK_USER_CREATED_AT = new Date();
MOCK_USER_CREATED_AT.setDate(MOCK_USER_CREATED_AT.getDate() - 5); // User registered 5 days ago

export const useTrial = (userCreatedAt: Date | null = MOCK_USER_CREATED_AT) => {
  const [trialState, setTrialState] = useState({
    isActive: true,
    isReadOnly: false,
    daysRemaining: 21,
  });

  useEffect(() => {
    if (!userCreatedAt) return;

    const calculateTrialState = () => {
      const registrationDate = new Date(userCreatedAt);
      const currentDate = new Date();
      const trialDurationDays = 21;

      const diffTime = currentDate.getTime() - registrationDate.getTime();
      const daysSinceRegistration = diffTime / (1000 * 60 * 60 * 24);

      if (daysSinceRegistration > trialDurationDays) {
        setTrialState({ isActive: false, isReadOnly: true, daysRemaining: 0 });
        return;
      }

      const daysRemaining = Math.ceil(trialDurationDays - daysSinceRegistration);
      setTrialState({ isActive: true, isReadOnly: false, daysRemaining });
    };

    calculateTrialState();
    const interval = setInterval(calculateTrialState, 1000 * 60 * 60); // Recalculate every hour

    return () => clearInterval(interval);
  }, [userCreatedAt]);

  return trialState;
};
