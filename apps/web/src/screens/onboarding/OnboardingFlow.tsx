'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFocient } from '../../state/focient-store';
import { authClient } from '../../lib/auth-client';
import { Step1WorkspaceScreen } from './Step1WorkspaceScreen';
import { Step2RhythmScreen } from './Step2RhythmScreen';
import { Step3TimeScreen } from './Step3TimeScreen';
import { Step4TaskScreen } from './Step4TaskScreen';
import { Step5ReviewScreen } from './Step5ReviewScreen';

export const OnboardingFlow: React.FC = () => {
  const router = useRouter();
  const { onboardingStep, user, isAuthenticated, completeOnboarding, language } = useFocient();

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/onboarding')) {
      const token = authClient.getToken();
      const savedUser = authClient.getUser();

      if (!isAuthenticated && (!token || !savedUser)) {
        router.replace('/login');
      } else if (user?.isOnboardingCompleted || savedUser?.isOnboardingCompleted) {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, user?.isOnboardingCompleted, user?.provider, router]);

  const handleSkipToDashboard = async () => {
    await completeOnboarding();
    router.push('/dashboard');
  };

  const renderCurrentStep = () => {
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

  return (
    <div className="w-full">
      {/* Demo Mode Guide Banner with 1-Click Skip to Dashboard */}
      {user?.provider === 'guest' && (
        <div className="w-full max-w-lg mx-auto mb-4 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-bold">
              {language === 'id' ? 'Mode Demonstrasi Onboarding' : 'Onboarding Demo Mode'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSkipToDashboard}
            className="font-semibold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{language === 'id' ? 'Lewati ke Dashboard' : 'Skip to Dashboard'}</span>
            <span>&rarr;</span>
          </button>
        </div>
      )}
      {renderCurrentStep()}
    </div>
  );
};
