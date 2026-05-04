// ── Replace with your Cloudflare Worker URL ──
const WORKER_URL = 'https://vswitch1worker1.glxy8b.workers.dev';

let motorOn   = false;
let isLoading = false;

document.getElementById('powerBtn').addEventListener('click', toggleMotor);

async function toggleMotor() {
  if (isLoading) return;

  const nextState = !motorOn;
  const state     = nextState ? 'On' : 'Off';

  setLoading(true);
  addLog('Sending command: ' + state.toUpperCase() + '...', 'pending');

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: state })
    });

    if (res.ok) {
      motorOn = nextState;
      setMotorState(motorOn);
      addLog('Motor turned ' + state.toUpperCase() + '.', 'success');
    } else {
      const err = await res.json().catch(function() { return {}; });
      addLog('Error ' + res.status + ': ' + (err.error || 'Request failed'), 'error');
    }
  } catch (e) {
    addLog('Network error: ' + e.message, 'error');
  } finally {
    setLoading(false);
  }
}

function setMotorState(on) {
  var btn  = document.getElementById('powerBtn');
  var dot  = document.getElementById('statusDot');
  var text = document.getElementById('statusText');
  btn.className  = 'power-btn ' + (on ? 'on' : 'off');
  dot.className  = 'dot '       + (on ? 'on' : 'off');
  text.className = 'status-value ' + (on ? 'on' : 'off');
  text.textContent = on ? 'RUNNING' : 'STOPPED';
}

function setLoading(val) {
  isLoading = val;
  var btn = document.getElementById('powerBtn');
  if (val) {
    btn.classList.add('loading');
  } else {
    btn.classList.remove('loading');
  }
}

function addLog(msg, type) {
  type = type || '';
  var list = document.getElementById('logEntries');
  var ts   = new Date().toTimeString().slice(0, 8);
  var li   = document.createElement('li');
  li.className = 'log-entry ' + type;
  var tsSpan  = document.createElement('span');
  tsSpan.className = 'ts';
  tsSpan.textContent = ts;
  var msgSpan = document.createElement('span');
  msgSpan.className = 'msg';
  msgSpan.textContent = msg;
  li.appendChild(tsSpan);
  li.appendChild(msgSpan);
  list.insertBefore(li, list.firstChild);
  while (list.children.length > 5) {
    list.removeChild(list.lastChild);
  }
}
