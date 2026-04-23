import { createHashRouter } from "react-router";
import { Root } from './components/Root';
import { HomePage } from './components/home-page';
import { SchedulePage } from './components/schedule-page';
import { PreparationPage } from './components/preparation-page';
import { AboutPage } from './components/about-page';
import { ReferencesPage } from './components/references-page';
import { FAQPage } from './components/faq-page';
import { DebriefDigestPage } from './components/debrief-digest-page';

export const router = createHashRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "about", Component: AboutPage },
      { path: "schedule", Component: SchedulePage },
      { path: "preparation", Component: PreparationPage },
      { path: "references", Component: ReferencesPage },
      { path: "faq", Component: FAQPage },
      { path: "debrief-digest", Component: DebriefDigestPage },
    ],
  },
]);