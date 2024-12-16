import { analytics } from '../config';
import { logEvent } from 'firebase/analytics';

export const logPageView = (pageName: string) => {
  logEvent(analytics, 'page_view', {
    page_name: pageName
  });
};

export const logUserAction = (actionName: string, params?: object) => {
  logEvent(analytics, actionName, params);
};