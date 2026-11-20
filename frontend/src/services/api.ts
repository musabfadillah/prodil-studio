import { MasterProfile, CoverLetterData } from '../types/cv';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('prodil_auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('prodil_auth_token', token);
    } else {
      localStorage.removeItem('prodil_auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('prodil_auth_token');
    }
    return this.token;
  }

  private getHeaders(extraHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Health Check
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      return await res.json();
    } catch {
      return { status: 'offline', message: 'Backend unreachable' };
    }
  }

  // Auth: Register
  async register(email: string, password: string, fullName: string) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });
    return await res.json();
  }

  // Auth: Verify Email
  async verifyEmail(email: string, code: string) {
    const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  // Auth: Resend Code
  async resendCode(email: string) {
    const res = await fetch(`${API_BASE}/api/auth/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  }

  // Auth: Login
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  // Auth: Google Sign-in
  async loginWithGoogle(payload: { email: string; name: string; picture?: string; googleId?: string }) {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  // Auth: Get Current User Profile
  async getMe() {
    if (!this.getToken()) return null;
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          this.setToken(null);
        }
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  }

  // Master Profile: Get
  async getMasterProfile(): Promise<MasterProfile | null> {
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (err) {
      console.warn('[API] Could not fetch remote master profile:', err);
    }
    return null;
  }

  // Master Profile: Save
  async saveMasterProfile(profile: MasterProfile) {
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(profile),
      });
      return await res.json();
    } catch (err) {
      console.warn('[API] Master profile save warning:', err);
      return { success: false, message: 'Saved locally' };
    }
  }

  // AI: Generate Summary
  async generateSummary(payload: {
    role: string;
    yearsOfExperience?: string;
    keySkills?: string;
    targetIndustry?: string;
    tone?: string;
  }) {
    const res = await fetch(`${API_BASE}/api/ai/generate-summary`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok && res.status === 401) {
      throw new Error('AUTH_REQUIRED');
    }
    return await res.json();
  }

  // AI: Optimize Bullet Points
  async optimizeBullets(payload: {
    role: string;
    rawBullets: string;
    jobDescription?: string;
  }) {
    const res = await fetch(`${API_BASE}/api/ai/optimize-bullets`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok && res.status === 401) {
      throw new Error('AUTH_REQUIRED');
    }
    return await res.json();
  }

  // AI: Generate Cover Letter
  async generateCoverLetter(payload: {
    masterProfile: MasterProfile;
    recipientName?: string;
    companyName: string;
    jobTitle: string;
    jobDescription?: string;
    tone?: string;
  }) {
    const res = await fetch(`${API_BASE}/api/ai/generate-cover-letter`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok && res.status === 401) {
      throw new Error('AUTH_REQUIRED');
    }
    return await res.json();
  }

  // AI: Smart Import (PDF/DOCX/Text)
  async smartImportFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/api/ai/smart-import`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok && res.status === 401) {
      throw new Error('AUTH_REQUIRED');
    }
    return await res.json();
  }
}

export const api = new ApiService();
