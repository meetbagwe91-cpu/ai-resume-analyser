// @ts-nocheck
import { useEffect, useState } from "react";
import { Joyride, STATUS } from "react-joyride";
import { useAppStore } from "~/lib/store";

const OnboardingTour = () => {
  const { user } = useAppStore();
  const [run, setRun] = useState(false);

  // Define the tour steps
  const steps: any[] = [
    {
      target: "body",
      content: "Welcome to Resumate! Let's take a quick tour to help you get the most out of your résumé analysis.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: ".btn-primary",
      content: "Here is where you can build a new résumé from scratch using AI, or upload an existing PDF for analysis.",
      placement: "bottom",
    },
    {
      target: ".dashboard-tabs",
      content: "Navigate between your recent analyses, performance timeline, saved templates, and profile settings.",
      placement: "bottom",
    },
    {
      target: ".support-widget-btn",
      content: "Need help? You can always reach out to us here, or check out our Help Center.",
      placement: "top-end",
    }
  ];

  useEffect(() => {
    if (!user) return;
    
    // Check local storage or firestore to see if user has seen the tour
    const hasSeenTour = localStorage.getItem(`resumate_tour_${user.uid}`);
    if (!hasSeenTour) {
      // Delay starting the tour to let the dashboard render
      setTimeout(() => setRun(true), 1000);
    }
  }, [user]);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (user) {
        localStorage.setItem(`resumate_tour_${user.uid}`, "true");
        // Optionally save this to user_preferences in Firestore too
      }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "var(--color-olive)",
          textColor: "var(--color-espresso)",
          backgroundColor: "#FAF7F2",
          arrowColor: "#FAF7F2",
          overlayColor: "rgba(44, 35, 24, 0.4)",
        },
        tooltip: {
          borderRadius: "1rem",
          boxShadow: "0 12px 40px rgba(44,35,24,0.15)",
          fontFamily: "var(--font-sans)",
        },
        buttonNext: {
          borderRadius: "100px",
          padding: "0.5rem 1rem",
          fontSize: "0.8rem",
          fontWeight: 500,
        },
        buttonBack: {
          color: "var(--color-stone)",
        },
        buttonSkip: {
          color: "var(--color-stone)",
        }
      } as any}
    />
  );
};

export default OnboardingTour;
