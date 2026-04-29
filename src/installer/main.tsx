import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import InstallerFrontend from '../lib/installer/InstallerFrontend';
import '../lib/styles/base.scss';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root for Smooth Installer');
}

const params = new URLSearchParams(window.location.search);
const requestUrl = params.get('requestUrl') ?? '/cgi-bin/request';
const responseUrl = params.get('responseUrl') ?? undefined;
const statusUrl = params.get('statusUrl') ?? undefined;
const pollMs = Number.parseInt(params.get('pollMs') ?? '1000', 10);

createRoot(root).render(
  <StrictMode>
    <InstallerFrontend
      requestUrl={requestUrl}
      responseUrl={responseUrl}
      statusUrl={statusUrl}
      pollMs={Number.isNaN(pollMs) ? 1000 : pollMs}
    />
  </StrictMode>,
);
