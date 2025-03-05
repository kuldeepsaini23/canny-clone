import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface OnboardingStep {
  id: number;
  title: string;
  complete: boolean;
  link: string;
}

interface OnboardingStore {
  steps: OnboardingStep[];
  markComplete: (id: number) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    immer((set) => ({
      steps: [
        { id: 1, title: "Customize Page", complete: false, link: "" },
        { id: 2, title: "Invite Team Members", complete: false , link: ""},
        { id: 3, title: "Go Live", complete: false , link: ""},
      ],

      markComplete: (id) =>
        set((state) => {
          const step = state.steps.find((s) => s.id === id);
          if (step) step.complete = true;
        }),

      reset: () =>
        set((state) => {
          state.steps.forEach((step) => (step.complete = false));
        }),
    })),
    {
      name: "onboarding-storage",
    }
  )
);
