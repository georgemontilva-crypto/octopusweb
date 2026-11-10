import { createContext, useContext, useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import Abyss from "./components/Abyss";
import Intro from "./components/Intro";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { NavBridge } from "./components/Transition";
import { storage } from "./lib/theme";
import Home from "./pages/Home";
import FlavorPage from "./pages/FlavorPage";
import LabReports from "./pages/LabReports";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const EnteredCtx = createContext(false);
export const useEntered = () => useContext(EnteredCtx);

export default function App() {
  const [entered, setEntered] = useState(() => storage.get("octopus_21_ok") === "1");

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
      <NavBridge />
      {!entered && <Intro onDone={() => setEntered(true)} />}
    </EnteredCtx.Provider>
  );
}
