const initializedCharts = new WeakSet();

// G2Plot 2.x redraws each slider view separately. A subview render skips the
// parent layout pass that aligns both axes, so their plot bounds can diverge.
export default function syncDualAxesLayout(plot) {
  const chart = plot?.chart;
  if (!chart || initializedCharts.has(chart)) return;
  initializedCharts.add(chart);

  const observedViews = new WeakSet();
  let synchronizing = false;

  const synchronize = () => {
    if (chart.destroyed || synchronizing) return;
    synchronizing = true;
    try {
      // Parent renders paint children recursively without calling view.render,
      // so this does not trigger another child afterrender event.
      chart.render(true);
    } finally {
      synchronizing = false;
    }
  };

  const observeViews = () => {
    chart.views.forEach((view) => {
      if (observedViews.has(view)) return;
      observedViews.add(view);
      view.on("afterrender", synchronize);
    });
  };

  // plot.update replaces its views; attach to those during the next paint too.
  chart.on("beforepaint", observeViews);
  observeViews();
  synchronize();
}
