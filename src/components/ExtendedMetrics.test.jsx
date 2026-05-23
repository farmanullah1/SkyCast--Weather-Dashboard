// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExtendedMetrics from './ExtendedMetrics';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

describe('ExtendedMetrics Component', () => {
  const mockCurrent = {
    uvIndex: 4,
    aqi: 2,
    sunrise: '06:00 AM',
    sunset: '08:00 PM',
    visibility: 10,
    windKph: 15,
    windDegree: 180,
    pressureMb: 1012,
    dewPointC: 12,
    moon_phase: 'Waxing Gibbous',
    moon_illumination: 85
  };

  it('renders all detailed weather labels and values correctly', () => {
    render(<ExtendedMetrics current={mockCurrent} />);
    
    // Check metric labels
    expect(screen.getByText('UV Index')).toBeInTheDocument();
    expect(screen.getByText('Visibility')).toBeInTheDocument();
    expect(screen.getByText('Wind Speed')).toBeInTheDocument();
    expect(screen.getByText('Pressure')).toBeInTheDocument();
    expect(screen.getByText('Dew Point')).toBeInTheDocument();
    expect(screen.getByText('Moon Phase')).toBeInTheDocument();

    // Check metric values
    expect(screen.getByText('10 km')).toBeInTheDocument();
    expect(screen.getByText('15 km/h')).toBeInTheDocument();
    expect(screen.getByText('1012 mb')).toBeInTheDocument();
    expect(screen.getByText('12°C')).toBeInTheDocument();
    expect(screen.getByText('Waxing Gibbous')).toBeInTheDocument();
    expect(screen.getByText('85% Illum.')).toBeInTheDocument();
  });
});
