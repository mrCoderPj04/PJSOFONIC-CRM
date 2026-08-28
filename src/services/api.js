const rawApiBase = 
  import.meta.env.VITE_API_BASE_URL || 
  import.meta.env.NEXT_PUBLIC_API_BASE_URL || 
  '/api/v1';

const API_BASE = rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;

export const getAuthToken = () => localStorage.getItem('pjsofonic_token');
export const setAuthToken = (token) => localStorage.setItem('pjsofonic_token', token);
export const removeAuthToken = () => localStorage.removeItem('pjsofonic_token');

export const getCurrentUserFromStorage = () => {
  const userStr = localStorage.getItem('pjsofonic_user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUserStorage = (user) => {
  localStorage.setItem('pjsofonic_user', JSON.stringify(user));
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (netErr) {
    throw new Error(
      `Cannot connect to CRM backend server (${netErr.message || 'NetworkError'}). Please ensure the CRM backend is running.`
    );
  }
  
  if (response.status === 401 && endpoint !== '/auth/ems-login') {
    removeAuthToken();
    localStorage.removeItem('pjsofonic_user');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    let errorMsg = 'API request failed';

    if (typeof errorData.detail === 'string') {
      errorMsg = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      errorMsg = errorData.detail.map(d => d.msg || JSON.stringify(d)).join(', ');
    } else if (errorData.detail && typeof errorData.detail === 'object') {
      errorMsg = errorData.detail.msg || errorData.detail.error || JSON.stringify(errorData.detail);
    } else if (errorData.error) {
      errorMsg = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
    } else if (errorData.message) {
      errorMsg = typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message);
    }

    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  emsLogin: async (loginId, password) => {
    try {
      // 1. Primary: Authenticate through CRM backend proxy
      return await request('/auth/ems-login', {
        method: 'POST',
        body: JSON.stringify({
          login_id: loginId,
          email: loginId,
          employeeId: loginId,
          password: password,
        }),
      });
    } catch (backendErr) {
      // 2. Client-Side Fallback: If Render server IP is rate-limited (HTTP 429), authenticate directly from browser
      const isRateLimit = backendErr.message && (
        backendErr.message.includes('429') || 
        backendErr.message.includes('rate-limited') || 
        backendErr.message.includes('high traffic') ||
        backendErr.message.includes('Too Many Requests')
      );

      if (isRateLimit) {
        try {
          const emsResponse = await fetch('https://erp-backend-1-02lc.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              employeeId: loginId,
              email: loginId,
              username: loginId,
              password: password,
            }),
          });

          if (emsResponse.ok) {
            const emsData = await emsResponse.json();
            const emsUser = emsData.user || emsData.employee || emsData;
            
            const emsDept = String(emsUser.department || emsUser.Department || emsUser.dept || '').toUpperCase();
            const emsRole = String(emsUser.role || emsUser.Role || '').toUpperCase();
            const isCustomer = emsDept.includes('CUSTOMER') || emsDept.includes('CLIENT') || emsRole.includes('CUSTOMER') || emsRole.includes('CLIENT');
            const isAdmin = ['ADMIN', 'ADMINISTRATION', 'MANAGEMENT', 'DIRECTOR', 'SUPERADMIN', 'DEVELOPER', 'LEAD', 'MANAGER'].some(adm => emsDept.includes(adm) || emsRole.includes(adm));

            if (!isCustomer && !isAdmin) {
              throw new Error(`Access Restricted: Only users from Customer or Admin departments can access CRM. (Your Department: ${emsUser.department || 'Not Specified'})`);
            }

            // Send verified EMS payload to CRM backend to generate CRM session token
            return await request('/auth/ems-login', {
              method: 'POST',
              body: JSON.stringify({
                login_id: loginId,
                password: password,
                ems_user_payload: emsUser,
                ems_token: emsData.accessToken || emsData.token,
              }),
            });
          } else {
            const emsErrData = await emsResponse.json().catch(() => ({}));
            throw new Error(emsErrData.error || emsErrData.message || 'Invalid EMS credentials.');
          }
        } catch (directErr) {
          throw new Error(directErr.message || backendErr.message);
        }
      }

      throw backendErr;
    }
  },
  getMe: () => request('/auth/me'),

  // KPIs & Reports
  getKPIs: () => request('/reports/kpis'),
  getSalesPipeline: () => request('/reports/sales-pipeline'),
  getProjectHealth: () => request('/reports/project-health'),
  getNotifications: () => request('/notifications'),
  getAuditLogs: () => request('/audit-logs'),

  // Leads
  getLeads: () => request('/leads'),
  createLead: (data) => request('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLeadStage: (id, stage) => request(`/leads/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),

  // Proposals
  getProposals: () => request('/proposals'),
  createProposal: (data) => request('/proposals', { method: 'POST', body: JSON.stringify(data) }),

  // Projects
  getProjects: (statusFilter = null) => request(`/projects${statusFilter ? `?status_filter=${statusFilter}` : ''}`),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  updateProjectStatus: (id, status, rejection_reason = null) => request(`/projects/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejection_reason }),
  }),
  updateProjectProgress: (id, overall_progress, subsystem_progress, health = 'ON_TRACK') => request(`/projects/${id}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ overall_progress, subsystem_progress, health }),
  }),
  syncProjectToERP: (projectId) => request(`/projects/${projectId}/sync-erp`, { method: 'POST' }),
  getProjectERPPayload: (projectId) => request(`/projects/${projectId}/erp-payload`),

  // Final Project Delivery & Approval
  submitFinalDeliverables: (projectId, data) => request(`/projects/${projectId}/final-submission`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  customerFinalApproval: (projectId, action, customer_notes = null) => request(`/projects/${projectId}/customer-final-approval`, {
    method: 'POST',
    body: JSON.stringify({ action, customer_notes }),
  }),

  // Project Details Sub-modules
  getMilestones: (projectId) => request(`/projects/${projectId}/milestones`),
  createMilestone: (projectId, data) => request(`/projects/${projectId}/milestones`, { method: 'POST', body: JSON.stringify(data) }),

  getUpdates: (projectId) => request(`/projects/${projectId}/updates`),
  createUpdate: (projectId, data) => request(`/projects/${projectId}/updates`, { method: 'POST', body: JSON.stringify(data) }),

  getFiles: (projectId) => request(`/projects/${projectId}/files`),
  uploadFile: (projectId, data) => request(`/projects/${projectId}/files`, { method: 'POST', body: JSON.stringify(data) }),

  getComments: (projectId) => request(`/projects/${projectId}/comments`),
  postComment: (projectId, message) => request(`/projects/${projectId}/comments`, { method: 'POST', body: JSON.stringify({ message }) }),

  getMeetings: (projectId) => request(`/projects/${projectId}/meetings`),
  scheduleMeeting: (projectId, data) => request(`/projects/${projectId}/meetings`, { method: 'POST', body: JSON.stringify(data) }),

  getApprovals: (projectId) => request(`/projects/${projectId}/approvals`),
  createApproval: (projectId, data) => request(`/projects/${projectId}/approvals`, { method: 'POST', body: JSON.stringify(data) }),
  reviewApproval: (approvalId, status, customer_notes = null) => request(`/projects/approvals/${approvalId}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ status, customer_notes }),
  }),
};
