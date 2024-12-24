export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: {
    ROOT: '/dashboard',
    OVERVIEW: '/dashboard/overview',
    ANALYTICS: '/dashboard/analytics'
  },
  INVENTORY: {
    ROOT: '/inventory',
    LIST: '/inventory/list',
    ADD: '/inventory/add',
    EDIT: '/inventory/edit'
  },
  REQUESTS: {
    ROOT: '/requests',
    PENDING: '/requests/pending',
    APPROVED: '/requests/approved',
    REJECTED: '/requests/rejected'
  },
  ORDERS: {
    ROOT: '/orders',
    ACTIVE: '/orders/active',
    HISTORY: '/orders/history'
  }
} as const;
