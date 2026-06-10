import React from 'react';

/**
 * Login-screen logo. Payload's admin renders a white wordmark fine on the dark
 * theme but it disappears on the light theme, so we render both variants and
 * swap them via the `data-theme` attribute Payload sets on <html>.
 */
const Logo: React.FC = () => (
  <>
    <img className="ne-logo ne-logo--light" src="/public/newera-logo-dark.png" alt="NEWERA" />
    <img className="ne-logo ne-logo--dark" src="/public/newera-logo.png" alt="NEWERA" />
  </>
);

export default Logo;
