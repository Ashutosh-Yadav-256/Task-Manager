const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function getDemoToken() {
  const res = await fetch('http://localhost:5000/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'demo', password: 'password123' })
  });
  const data = await res.json();
  return data.token;
}

async function createTarget() {
  const res = await fetch('http://localhost:9222/json/new?http://localhost:3001/login', {
    method: 'PUT'
  });
  return await res.json();
}

async function closeTarget(targetId) {
  try {
    await fetch(`http://localhost:9222/json/close/${targetId}`);
  } catch (e) {}
}

function sendCDP(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      } catch (e) {
        reject(e);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function capture() {
  console.log('1. Getting demo session token...');
  const token = await getDemoToken();
  console.log('Token acquired successfully.');

  console.log('2. Creating Chrome CDP target...');
  const target = await createTarget();
  console.log('Target created:', target.id);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve));
  console.log('WebSocket connected to CDP.');

  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'DOM.enable');
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1.5,
    mobile: false
  });

  // --- SCREENSHOT 1: Login Page ---
  console.log('3. Navigating to Login Page...');
  await sendCDP(ws, 'Page.navigate', { url: 'http://localhost:3001/login' });
  await delay(2500);

  console.log('Capturing Login Screenshot...');
  const loginShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const loginPath = path.join(SCREENSHOT_DIR, '01_taskflow_login.png');
  fs.writeFileSync(loginPath, Buffer.from(loginShot.data, 'base64'));
  console.log('Saved:', loginPath);

  // --- SCREENSHOT 2: Dashboard Kanban Board ---
  console.log('4. Injecting auth token and navigating to Dashboard...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      localStorage.setItem('auth-token', '${token}');
      window.location.href = 'http://localhost:3001/';
    `
  });
  await delay(3500);

  console.log('Capturing Dashboard Kanban Screenshot...');
  const dashShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const dashPath = path.join(SCREENSHOT_DIR, '02_taskflow_kanban_dashboard.png');
  fs.writeFileSync(dashPath, Buffer.from(dashShot.data, 'base64'));
  console.log('Saved:', dashPath);

  // --- SCREENSHOT 3: Add/Edit Task Modal ---
  console.log('5. Clicking FAB to open Task Modal...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      const fab = document.querySelector('button[aria-label="Add New Task"]') || 
                  document.querySelector('.MuiFab-root') || 
                  document.querySelector('button');
      if (fab) fab.click();
    `
  });
  await delay(1200);

  console.log('Capturing Task Modal Screenshot...');
  const modalShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const modalPath = path.join(SCREENSHOT_DIR, '03_taskflow_task_modal.png');
  fs.writeFileSync(modalPath, Buffer.from(modalShot.data, 'base64'));
  console.log('Saved:', modalPath);

  // Close modal with Escape key
  await sendCDP(ws, 'Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  await sendCDP(ws, 'Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
  await delay(1000);

  // --- SCREENSHOT 4: Dark Mode ---
  console.log('6. Switching to Dark Theme...');
  await sendCDP(ws, 'Runtime.evaluate', {
    expression: `
      const themeBtn = document.querySelector('button[aria-label="toggle theme"]');
      if (themeBtn) themeBtn.click();
    `
  });
  await delay(1200);

  console.log('Capturing Dark Mode Screenshot...');
  const darkShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const darkPath = path.join(SCREENSHOT_DIR, '04_taskflow_dark_mode.png');
  fs.writeFileSync(darkPath, Buffer.from(darkShot.data, 'base64'));
  console.log('Saved:', darkPath);

  // --- SCREENSHOT 5: Mobile Viewport ---
  console.log('7. Switching to Mobile Viewport (390x844)...');
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2.0,
    mobile: true
  });
  await delay(1200);

  console.log('Capturing Mobile Viewport Screenshot...');
  const mobileShot = await sendCDP(ws, 'Page.captureScreenshot', { format: 'png' });
  const mobilePath = path.join(SCREENSHOT_DIR, '05_taskflow_mobile_view.png');
  fs.writeFileSync(mobilePath, Buffer.from(mobileShot.data, 'base64'));
  console.log('Saved:', mobilePath);

  ws.close();
  await closeTarget(target.id);
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
