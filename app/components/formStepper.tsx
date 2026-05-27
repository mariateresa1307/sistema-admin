'use client';
import React from 'react';
import { Stepper, Step, StepLabel } from '@mui/material';

interface FormStepperProps {
  activeStep: number;
  steps: string[];
}

export function FormStepper({ activeStep, steps }: FormStepperProps) {
  return (
    <Stepper 
      activeStep={activeStep} 
      sx={{ 
        my: 3, 
        '& .MuiStepIcon-root.Mui-active': { color: '#000027' }, 
        '& .MuiStepIcon-root.Mui-completed': { color: '#2e7d32' } 
      }}
    >
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}