import React from 'react';
import {
  Code2,
  BrainCircuit,
  Palette,
  BarChart3,
  PenLine,
  LifeBuoy,
  Box,
} from 'lucide-react';
import { ServiceCategory } from '../data/seed';

interface CategoryIconProps {
  icon: ServiceCategory['icon'];
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon,
  size = 20,
  className = 'ic',
}) => {
  switch (icon) {
    case 'Code2':
      return <Code2 size={size} strokeWidth={1.75} className={className} aria-hidden="true" focusable="false" />;
    case 'BrainCircuit':
      return <BrainCircuit size={size} strokeWidth={1.75} className={className} aria-hidden="true" focusable="false" />;
    case 'Palette':
      return <Palette size={size} strokeWidth={1.75} className={className} aria-hidden="true" focusable="false" />;
    case 'BarChart3':
      return <BarChart3 size={size} strokeWidth={1.75} className={className} aria-hidden="true" focusable="false" />;
    case 'PenLine':
      return <PenLine size={size} strokeWidth={1.75} className={className} aria-hidden="true" focusable="false" />;
    case 'LifeBuoy':
      return <LifeBuoy size={size} strokeWidth={1.75} className={className} aria-hidden="true" focusable="false" />;
    case 'Box':
      return <Box size={size} strokeWidth={1.75} className={className} aria-hidden="true" focusable="false" />;
    default:
      return <Code2 size={size} strokeWidth={1.75} className={className} aria-hidden="true" focusable="false" />;
  }
};
