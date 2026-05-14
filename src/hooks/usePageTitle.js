import { useEffect } from "react";

const APP_TITLE = "Postjamm";

export const getPageTitle = (pageName) => {
  const trimmedPageName = pageName?.trim();
  return trimmedPageName ? `${APP_TITLE} | ${trimmedPageName}` : APP_TITLE;
};

export function usePageTitle(pageName) {
  useEffect(() => {
    document.title = getPageTitle(pageName);
  }, [pageName]);
}
