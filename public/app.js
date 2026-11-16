const statusDisplay = document.getElementById('status-display');
const bodyDisplay = document.getElementById('body-display');

async function callEndpoint(url, options = {}) {
  statusDisplay.textContent = 'Fetching...';
  bodyDisplay.textContent = 'Awaiting server response...';

  try {
    const response = await fetch(url, options);
    statusDisplay.textContent = `${response.status} ${response.statusText}`;

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      bodyDisplay.textContent = JSON.stringify(data, null, 2);
    } else {
      const text = await response.text();
      bodyDisplay.textContent = text;
    }
  } catch (err) {
    statusDisplay.textContent = 'Network Error';
    bodyDisplay.textContent = `Error executing fetch: ${err.message}`;
  }
}

document.getElementById('btn-courses').addEventListener('click', () => callEndpoint('/api/courses'));
document.getElementById('btn-status').addEventListener('click', () => callEndpoint('/api/status'));
document.getElementById('btn-headers').addEventListener('click', () => callEndpoint('/api/headers'));
document.getElementById('btn-subscribe').addEventListener('click', () => {
  callEndpoint('/api/subscribe', { method: 'POST' });
});
document.getElementById('btn-admin').addEventListener('click', () => callEndpoint('/api/admin'));
document.getElementById('btn-stats').addEventListener('click', () => callEndpoint('/api/stats'));
document.getElementById('btn-missing').addEventListener('click', () => callEndpoint('/api/missing-route'));