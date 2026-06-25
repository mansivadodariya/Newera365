import { getTranslations } from 'next-intl/server';
import { ThreeStepsClient, type Step } from './ThreeStepsClient';

/**
 * Demo restyle of ThreeStepsSection — resolves copy on the server and hands the
 * scroll-coupled stepper (connector fill + lighting nodes) to ThreeStepsClient.
 */
export async function ThreeStepsSectionDemo() {
  const t = await getTranslations('home');

  const steps: Step[] = [
    { num: '01', title: t('step1Title'), desc: t('step1Desc') },
    { num: '02', title: t('step2Title'), desc: t('step2Desc') },
    { num: '03', title: t('step3Title'), desc: t('step3Desc') },
  ];

  return <ThreeStepsClient kicker={t('stepsKicker')} heading={t('stepsHeading')} steps={steps} />;
}
