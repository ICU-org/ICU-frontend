import { I18nProvider } from "./providers/I18nProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import Router from "./Router";

const App = () => (
  <ThemeProvider>
    <I18nProvider>
      <Router />
    </I18nProvider>
  </ThemeProvider>
);

export default App;
