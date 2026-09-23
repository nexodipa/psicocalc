import React from 'react';
import {
  BatteryType,
  CompositeResult,
  PatientDemographics,
  StrengthWeaknessResult,
  SubtestId,
  validateAgeAndBattery,
} from '../../../core';
import { InstitutionalHeader } from './InstitutionalHeader';
import { DemographicsTable } from './DemographicsTable';
import { PrimaryIndicesTable } from './PrimaryIndicesTable';
import { SubtestSummaryTable } from './SubtestSummaryTable';
import { AutomatedNarrative } from './AutomatedNarrative';
import { SignatureBlock } from './SignatureBlock';
import { ProfileScatterChart } from '../charts/ProfileScatterChart';
import { GaussianBellCurve } from '../charts/GaussianBellCurve';

interface ClinicalReportViewProps {
  battery: BatteryType;
  demographics: PatientDemographics;
  displayName: string;
  ageValidation: ReturnType<typeof validateAgeAndBattery>;
  cit: CompositeResult | null;
  primaryIndices: Record<string, CompositeResult | null>;
  subtests: Partial<Record<SubtestId, number>>;
  strengthsWeaknesses: StrengthWeaknessResult[];
  isCompleteCit: boolean;
}

export const ClinicalReportView: React.FC<ClinicalReportViewProps> = ({
  battery,
  demographics,
  displayName,
  ageValidation,
  cit,
  primaryIndices,
  subtests,
  strengthsWeaknesses,
  isCompleteCit,
}) => {
  return (
    <div className="max-w-4xl mx-auto my-6 bg-white border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-10 page-container print:p-0 print:border-none print:shadow-none print:m-0 print:max-w-full">
      {/* Page 1: Institutional Header, Demographics, Primary Indices Table, and Charts */}
      <div className="report-page-1">
        <InstitutionalHeader battery={battery} />

        <DemographicsTable
          demographics={demographics}
          displayName={displayName}
          ageValidation={ageValidation}
        />

        <PrimaryIndicesTable
          battery={battery}
          cit={cit}
          primaryIndices={primaryIndices}
          isCompleteCit={isCompleteCit}
        />

        {/* Embedded Pure Vector SVG Charts */}
        <div className="avoid-break space-y-4 my-6">
          <ProfileScatterChart
            battery={battery}
            subtests={subtests}
            strengthsWeaknesses={strengthsWeaknesses}
          />

          <GaussianBellCurve
            battery={battery}
            cit={cit}
            primaryIndices={primaryIndices}
            isCompleteCit={isCompleteCit}
          />
        </div>
      </div>

      {/* Clean Page Break for Print */}
      <div className="print-page-break my-8 border-t border-slate-200 print:border-none print:m-0" />

      {/* Page 2: Subtests Breakdown, Automated Clinical Narrative, and Signature Block */}
      <div className="report-page-2 pt-4 print:pt-0">
        <SubtestSummaryTable
          battery={battery}
          subtests={subtests}
          strengthsWeaknesses={strengthsWeaknesses}
        />

        <AutomatedNarrative
          battery={battery}
          displayName={displayName}
          cit={cit}
          primaryIndices={primaryIndices}
          subtests={subtests}
          strengthsWeaknesses={strengthsWeaknesses}
          isCompleteCit={isCompleteCit}
        />

        <SignatureBlock
          examinerName={demographics.examiner}
          testDate={demographics.testDate}
        />
      </div>
    </div>
  );
};
