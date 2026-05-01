const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Consistent API wrapper — every function returns {data, error}
 */
async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: data.detail || data.message || 'Request failed' };
    }

    if (data.error) {
      return { data: null, error: data.message || 'Unknown error' };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Network error' };
  }
}

// ── Tender ──
export async function uploadTender(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE}/api/tender/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) return { data: null, error: data.detail?.message || 'Upload failed' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function checkIntegrity(criterionText, category = 'construction') {
  return apiFetch('/api/tender/integrity-check', {
    method: 'POST',
    body: JSON.stringify({ criterion_text: criterionText, category }),
  });
}

export async function getTenderStatus(tenderId) {
  return apiFetch(`/api/tender/${tenderId}/status`);
}

// ── Evaluation ──
export async function getEvaluationResults(tenderId) {
  return apiFetch(`/api/evaluation/${tenderId}/results`);
}

export async function getYellowQueue(tenderId) {
  return apiFetch(`/api/evaluation/${tenderId}/yellow-queue`);
}

export async function postOfficerDecision(payload) {
  return apiFetch('/api/evaluation/officer-decision', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Collusion ──
export async function runCollusionScan(payload) {
  return apiFetch('/api/collusion/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCollusionReport(tenderId) {
  return apiFetch(`/api/collusion/${tenderId}/report`);
}

// ── Builder ──
export async function uploadBuilderPhoto(payload) {
  const formData = new FormData();
  formData.append('contract_id', payload.contract_id);
  formData.append('latitude', payload.latitude);
  formData.append('longitude', payload.longitude);
  if (payload.photos) {
    payload.photos.forEach((p) => formData.append('photos', p));
  }

  try {
    const response = await fetch(`${API_BASE}/api/builder/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) return { data: null, error: data.detail?.message || data.detail || 'Upload failed' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function getMilestones(contractId) {
  return apiFetch(`/api/builder/${contractId}/milestones`);
}

// ── Payment ──
export async function triggerPayment(payload) {
  return apiFetch('/api/payment/trigger', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Audit ──
export async function getAuditTrail(entityId) {
  return apiFetch(`/api/audit/${entityId}/trail`);
}

export async function getAllAuditEntries() {
  return apiFetch('/api/audit/all');
}

// ── Health ──
export async function healthCheck() {
  return apiFetch('/api/health');
}
