'use client';

import React from 'react';
import { useFocient } from '../../state/focient-store';
import { Step1WorkspaceScreen } from './Step1WorkspaceScreen';
import { Step2RhythmScreen } from './Step2RhythmScreen';
import { Step3TimeScreen } from './Step3TimeScreen';
import { Step4TaskScreen } from './Step4TaskScreen';
import { Step5ReviewScreen } from './Step5ReviewScreen';

export const OnboardingFlow: React.FC = () => {
  const { onboardingStep, user, isAuthenticated } = useFocient();

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/onboarding')) {
      if (!isAuthenticated) {
        window.history.replaceState(null, '', '/login');
        window.location.replace('/login');
      } else if (user?.isOnboardingCompleted) {
        window.history.replaceState(null, '', '/today');
        window.location.replace('/today');
      }
    }
  }, [isAuthenticated, user?.isOnboardingCompleted]);

  switch (onboardingStep) {
    case 1:
      return <Step1WorkspaceScreen />;
    case 2:
      return <Step2RhythmScreen />;
    case 3:
      return <Step3TimeScreen />;
    case 4:
      return <Step4TaskScreen />;
    case 5:
      return <Step5ReviewScreen />;
    default:
      return <Step1WorkspaceScreen />;
  }
};
