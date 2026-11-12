import { createContext, useContext, useEffect, useState } from "react";
import { Route, Switch, Redirect } from "wouter";
import Intro from "./components/Intro";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { NavBridge } from "./components/Transition";
import { storage } from "./lib/theme";
import Home from "./pages/Home";
import Products from "./pages/Products";
import FlavorPage from "./pages/FlavorPage";
import About from "./pages/About";
import LabReports from "./pages/LabReports";
import Contact from "./pages/Contact";
import Wholesale from "./pages/Wholesale";
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
      <NavBridge />
      <Nav />
      <main className="main">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={FlavorPage} />
          <Route path="/flavors/:slug">{(p: { slug: string }) => <Redirect to={`/products/${p.slug}`} replace />}</Route>
          <Route path="/about" component={About} />
          <Route path="/lab-reports" component={LabReports} />
          <Route path="/contact" component={Contact} />
          <Route path="/wholesale" component={Wholesale} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      {!entered && <Intro onDone={() => setEntered(true)} />}
    </EnteredCtx.Provider>
  );
}
