import React from 'react';

/**
 * Nav icon. Same theme-swap approach as Logo — the white wordmark is invisible
 * on the light admin theme, so we show a dark-ink variant there.
 */
const Icon: React.FC = () => (
  <>
    <img className="ne-icon ne-icon--light" src="/public/newera-logo-dark.png" alt="NEWERA" />
    <img className="ne-icon ne-icon--dark" src="/public/newera-logo.png" alt="NEWERA" />
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .ne-icon { height: 80px; width: auto; display: block; }
          .ne-icon--dark { display: none; }
          [data-theme='dark'] .ne-icon--light { display: none; }
          [data-theme='dark'] .ne-icon--dark { display: block; }
        `,
      }}
    />
  </>
);

export default Icon;
