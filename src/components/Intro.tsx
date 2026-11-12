import { useEffect, useRef, useState } from "react";
import { gsap, lockScroll } from "../lib/motion";
import { storage } from "../lib/theme";
import { preload3D } from "../three/Product3D";

const KEY = "octopus_21_ok";

/** Age verification, shown immediately (no loading sequence). */
export default function Intro({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    preload3D();
    lockScroll(true);
    return () => lockScroll(false);
  }, []);

  const yes = () => {
    storage.set(KEY, "1");
    gsap.to(root.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.out",
      onComplete: () => {
        lockScroll(false);
        onDone();
      },
    });
  };

  return (
    <div ref={root} className="intro" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className="intro-center">
        <img src="/img/logo.webp" alt="OCTOPUS" className="intro-logo" />
        {!denied ? (
          <div className="gate">
            <p className="gate-kicker">Botanical products · Adults only</p>
            <h2 className="gate-title" id="gate-title">Are you 21 or older?</h2>
            <div className="gate-actions">
              <button className="btn btn-primary" onClick={yes}>Yes, enter</button>
              <button className="btn btn-line" onClick={() => setDenied(true)}>No</button>
            </div>
          </div>
        ) : (
          <div className="gate">
            <h2 className="gate-title">Come back when you're 21.</h2>
            <button className="btn btn-line" onClick={() => setDenied(false)}>Go back</button>
          </div>
        )}
      </div>
    </div>
  );
}
