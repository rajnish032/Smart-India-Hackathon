"use client";

import React from 'react';
import Sidebar from './Sidebar';
import ActiveStudyTracker from '../learner/ActiveStudyTracker';

export default function LearnerSidebar(props) {
  return (
    <>
      <Sidebar role="LEARNER" {...props} />
      <ActiveStudyTracker />
    </>
  );
}

