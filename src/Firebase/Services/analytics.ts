import { analytics } from '../Config';
import { logEvent } from 'firebase/analytics';

export const logPageView = (pageName: string): void => {
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_name: pageName
    });
  }
};

export const logUserAction = (actionName: string, params?: object): void => {
  if (analytics) {
    logEvent(analytics, actionName, params);
  }
};