import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// El backend NestJS corre en el puerto 3000 y NO tiene prefijo /api
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001') + '/api';

// Helper: eliminar barra final
const base = BASE_URL.replace(/\/+$/, '');

// fetchWithApiFallback se mantiene por compatibilidad con páginas que lo importan
export async function fetchWithApiFallback(
  endpoint: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(endpoint, init);
}

export const API_ROUTES = {
  AUTH: {
    LOGIN: `${base}/auth/login`,
    REGISTER: `${base}/auth/register`,
    FORGOT_PASSWORD: `${base}/auth/forgot-password`,
    RESET_PASSWORD: `${base}/auth/reset-password`,
    PROFILE: `${base}/auth/profile`,
  },
  USERS: {
    GET_ALL: `${base}/users`,
    CREATE: `${base}/users`,
    GET_BY_ID: (id: string) => `${base}/users/${id}`,
    UPDATE: (id: string) => `${base}/users/${id}`,
    DELETE: (id: string) => `${base}/users/${id}`,
    ONBOARDING_DONE: `${base}/users/me/onboarding-done`,
  },
  COURSES: {
    GET_ALL: `${base}/courses`,
    CREATE: `${base}/courses`,
    GET_BY_ID: (id: string) => `${base}/courses/${id}`,
    UPDATE: (id: string) => `${base}/courses/${id}`,
    DELETE: (id: string) => `${base}/courses/${id}`,
  },
  DOCUMENTS: {
    GET_ALL: `${base}/document`,
    CREATE: `${base}/document`,
    DELETE: (id: string) => `${base}/document/${id}`,
  },
  SERVICES: {
    GET_ALL: `${base}/services`,
    CREATE: `${base}/services`,
    GET_BY_ID: (id: string) => `${base}/services/${id}`,
    UPDATE: (id: string) => `${base}/services/${id}`,
    DELETE: (id: string) => `${base}/services/${id}`,
  },
  COMPANIES: {
    GET_ALL: `${base}/company`,
    CREATE: `${base}/company`,
    GET_BY_ID: (id: string) => `${base}/company/${id}`,
    UPDATE: (id: string) => `${base}/company/${id}`,
    DELETE: (id: string) => `${base}/company/${id}`,
  },
  CONTENT: {
    GET_ALL: (courseId: string) => `${base}/courses/${courseId}/content`,
    CREATE: (courseId: string) => `${base}/courses/${courseId}/content`,
    GET_BY_ID: (courseId: string, contentId: string) =>
      `${base}/courses/${courseId}/content/${contentId}`,
    UPDATE: (courseId: string, contentId: string) =>
      `${base}/courses/${courseId}/content/${contentId}`,
    DELETE: (courseId: string, contentId: string) =>
      `${base}/courses/${courseId}/content/${contentId}`,
  },
  ANNOUNCEMENTS: {
    GET_ALL: `${base}/announcement`,
    GET_PUBLIC: `${base}/announcement/public`,
    CREATE: `${base}/announcement`,
    DELETE: (id: string) => `${base}/announcement/${id}`,
  },
  COMPANY_REQUESTS: {
    CREATE: `${base}/company-request`,
    GET_ALL: `${base}/company-request`,
    APPROVE: (id: string) => `${base}/company-request/${id}/approve`,
    REJECT: (id: string) => `${base}/company-request/${id}/reject`,
    ARCHIVE: (id: string) => `${base}/company-request/${id}/archive`,
    UNARCHIVE: (id: string) => `${base}/company-request/${id}/unarchive`,
    GET_ARCHIVED: `${base}/company-request?archived=true`,
  },
  ONBOARDING: {
    SETUP: `${base}/onboarding/setup`,
    ME: `${base}/onboarding/me`,
    TOGGLE: `${base}/onboarding/toggle`,
  },
  CHATBOT: {
    SEND: `${base}/chatbot`,
  },
  ENROLLMENTS: {
    BASE: `${base}/enrollment`,
    BULK: `${base}/enrollment/bulk`,
  },
  STATS: {
    GET: `${base}/stats`,
  },
};
