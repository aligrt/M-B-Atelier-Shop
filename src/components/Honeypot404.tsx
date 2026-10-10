import React from 'react';

interface Honeypot404Props {
  attemptedPath: string;
  onReturnToStore: () => void;
}

/**
 * Deception Honeypot 404 Response Component
 * Thwarts automated reconnaissance scanners (e.g. dirbuster, ffuf, nikto) and curious visitors
 * by returning an authentic Apache/Ubuntu 404 Not Found response.
 */
export const Honeypot404: React.FC<Honeypot404Props> = ({ attemptedPath, onReturnToStore }) => {
  return (
    <div className="min-h-screen bg-white text-black font-serif p-6 sm:p-12 flex flex-col justify-start select-text">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2 border-b border-neutral-300 pb-3">
          404 Not Found
        </h1>
        <p className="text-sm text-neutral-800 mb-4 font-mono">
          The requested URL <span className="font-semibold text-rose-700">{attemptedPath}</span> was not found on this server.
        </p>
        <p className="text-xs text-neutral-500 mb-8 font-mono">
          Additionally, a 404 Not Found error was encountered while trying to use an ErrorDocument to handle the request.
        </p>

        <hr className="border-neutral-300 my-4" />

        <address className="text-xs text-neutral-600 not-italic font-mono mb-6">
          Apache/2.4.52 (Ubuntu) Server at mbatelier.shop Port 443
        </address>

        <div className="pt-4 font-sans">
          <button
            onClick={onReturnToStore}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-md transition-colors shadow-sm cursor-pointer"
          >
            ← Return to Storefront Home
          </button>
        </div>
      </div>
    </div>
  );
};
