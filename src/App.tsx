import { createContext, useContext, useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import Abyss from "./components/Abyss";
import Cursor from "./components/Cursor";
import Intro from "./components/Intro";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { InkOverlay } from "./components/Transition";
import Home from "./pages/Home";
import FlavorPage from "./pages/FlavorPage";
import LabReports from "./pages/LabReports";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const EnteredCtx = createContext(false);
export const useEntered = () => useContext(EnteredCtx);

export default function App() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  return (
    <EnteredCtx.Provider value={entered}>
      <Abyss />
      <div className="grain" aria-hidden />
      <Nav />
      <main className="main">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/flavors/:slug" component={FlavorPage} />
          <Route path="/lab-reports" component={LabReports} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <InkOverlay />
      <Cursor />
      {!entered && <Intro onDone={() => setEntered(true)} />}
    </EnteredCtx.Provider>
  );
}
