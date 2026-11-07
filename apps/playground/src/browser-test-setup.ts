import { afterEach } from "vitest";
import { cleanup } from "vitest-browser-react";

// vitest-browser-react unmounts a test's render only when the next test starts. React Aria
// finishes some teardown a frame or two later, such as moving focus back after a popover
// closes, and that landed in the next test: on a slow CI machine it refocused the next
// test's combobox and cleared what it had typed. Unmount at the end of each test instead,
// and give that work time to finish there.
afterEach(async () => {
  await cleanup();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
});
