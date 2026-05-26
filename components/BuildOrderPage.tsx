import React from 'react';

import { OrderBuilder } from './OrderBuilder';

interface BuildOrderPageProps {
  onNavigateToMockup?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToCatalog?: () => void;
}

// Thin wrapper. The OrderBuilder owns the page header, stepper, and form;
// nothing else should live on this route.
export const BuildOrderPage: React.FC<BuildOrderPageProps> = ({
  onNavigateToMockup,
  onNavigateToContact,
  onNavigateToCatalog,
}) => {
  return (
    <OrderBuilder
      onNavigateToMockup={onNavigateToMockup}
      onNavigateToContact={onNavigateToContact}
      onNavigateToCatalog={onNavigateToCatalog}
    />
  );
};
